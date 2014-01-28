# Nimbus Server
Nimbus server, 同样是使用storm命令`storm nimbus`来启动 

看下源码, 此处和上面client不同, `jvmtype="-server"`, 最终调用"backtype.storm.daemon.nimbus"的main 
nimbus是用clojure实现的, 但是clojure是基于JVM的, 所以在最终发布的时候会产生nimbus.class, 所以在用户使用的时候完全可以不知道clojure, 看上去所有都是Java 
clojure只是用于提高开发效率而已.

    def nimbus():
        """Syntax: [storm nimbus]

    Launches the nimbus daemon. This command should be run under
    supervision with a tool like daemontools or monit.

    See Setting up a Storm cluster for more information.
    (https://github.com/nathanmarz/storm/wiki/Setting-up-a-Storm-cluster)
    """
        cppaths = [STORM_DIR + "/log4j", STORM_DIR + "/conf"]
        childopts = confvalue("nimbus.childopts", cppaths) + " -Dlogfile.name=nimbus.log -Dlog4j.configuration=storm.log.properties"
        exec_storm_class(
            "backtype.storm.daemon.nimbus",
            jvmtype="-server",
            extrajars=cppaths,
            childopts=childopts)


## launch-server!

来看看nimbus的main, 最终会调到`launch-server!`, conf参数是调用`read-storm-config`读出的配置参数, 
而nimbus是INimbus接口`backtype.storm.scheduler.INimbus`的实现, 可以参考standalone-nimbus

    (defn -main []
      (-launch (standalone-nimbus)))
    (defn -launch [nimbus]
      (launch-server! (read-storm-config) nimbus))

    (defn launch-server! [conf nimbus]
      (validate-distributed-mode! conf)
      (let [service-handler (service-handler conf nimbus)
            options (-> (TNonblockingServerSocket. (int (conf NIMBUS-THRIFT-PORT)))
                        (THsHaServer$Args.)
                        (.workerThreads 64)
                        (.protocolFactory (TBinaryProtocol$Factory.))
                        (.processor (Nimbus$Processor. service-handler))
                        )
           server (THsHaServer. options)]
        (.addShutdownHook (Runtime/getRuntime) (Thread. (fn [] (.shutdown service-handler) (.stop server))))
        (log-message "Starting Nimbus server...")
        (.serve server)))

1. service-handler

  首先定义service-handler,  service-handler前面的定义如下

        (defserverfn service-handler [conf inimbus]
            (reify Nimbus$Iface
              ...)
        )

  这边用到一个macro定义defserverfn, 如下

        (defmacro defserverfn [name & body]
          `(let [exec-fn# (fn ~@body)]
            (defn ~name [& args#]0
              (try-cause
                (apply exec-fn# args#)
              (catch InterruptedException e#
                (throw e#))
              (catch Throwable t#
                (log-error t# "Error on initialization of server " ~(str name))
                (halt-process! 13 "Error on initialization")
                )))))

  这个macro两个参数, 结合例子, name = service-handler, body就是后面所有的,包括参数和函数体 
  定义匿名函数 `fn[conf inimbus] (……)`
  定义函数`defn service-handler [& args]`, 里面只是简单的调用`fn…`使用这个macro和直接定义`defn service-handler [conf inimbus]`几乎没有啥区别 
  我有个疑问, 为什么要定义这个无聊的macro, 难道就是为了便于后面的exception处理
  在service-handler函数里面最主要就是实现NimbusIface接口(backtype.storm.generated.NimbusIface, $在class文件里面就是这样写的, 应该是java的命名规则)
2. server

 生成server option参数, 使用TNonblockingServerSocket, 定义的work thread数目, 使用的protocol和使用的processor 
 其中processor, 是server上主要的处理进程, 使用传入的service-handler进行数据处理
 最终启动nimbus server.

## Nimbus$Iface

Nimbus server已经启动, 剩下就是处理从client传来的RPC调用, 关键就是Nimbus$Iface的实现

在下面的实现中总是用到nimbus这个变量, nimbus-data, 用于存放nimbus相关配置和全局的参数

      let [nimbus (nimbus-data conf inimbus)]
      (defn nimbus-data [conf inimbus]
        (let [forced-scheduler (.getForcedScheduler inimbus)]
          {:conf conf
           :inimbus inimbus
           :submitted-count (atom 0) ;记录多少topology被submit
           :storm-cluster-state (cluster/mk-storm-cluster-state conf) ;抽象Zookeeper接口(Zookeeper用于存放cluster state)
           :submit-lock (Object.) ;创建锁对象,用于各个topology之间的互斥操作, 比如建目录
           :heartbeats-cache (atom {}) ;记录各个Topology的heartbeats的cache
           :downloaders (file-cache-map conf)
           :uploaders (file-cache-map conf)
           :uptime (uptime-computer)
           :validator (new-instance (conf NIMBUS-TOPOLOGY-VALIDATOR))
           :timer (mk-timer :kill-fn (fn [t]
                                       (log-error t "Error when processing event")
                                       (halt-process! 20 "Error when processing an event")
                                       ))
           :scheduler (mk-scheduler conf inimbus)
           }))

## submitTopology
4个参数:

* `^String storm-name`, storm名字 
* `^String uploadedJarLocation`, 上传Jar的目录  
* `^String serializedConf`, 序列化过的Conf信息 
* `^StormTopology topology`, topology对象(thrift对象), 由topologyBuilder产生

        (^void submitTopology
            [this ^String storm-name ^String uploadedJarLocation ^String serializedConf ^StormTopology topology]
            (try
              (validate-topology-name! storm-name) ;;名字起的是否符合规范
              (check-storm-active! nimbus storm-name false) ;;check是否active
              (.validate ^backtype.storm.nimbus.ITopologyValidator (:validator nimbus) ;;调用用户定义的validator.validate
                         storm-name
                         (from-json serializedConf)
                         topology)
              (swap! (:submitted-count nimbus) inc) ;;submitted-count加1, 表示nimbus上submit的topology的数量
              (let [storm-id (str storm-name "-" @(:submitted-count nimbus) "-" (current-time-secs)) ;;生成storm-id
                    storm-conf (normalize-conf  ;;转化成json,增加kv,最终生成storm-conf
                                conf
                                (-> serializedConf
                                    from-json
                                    (assoc STORM-ID storm-id)
                                    (assoc TOPOLOGY-NAME storm-name))
                                topology)
                    total-storm-conf (merge conf storm-conf)
                    topology (normalize-topology total-storm-conf topology) ;;规范化的topology对象
                    topology (if (total-storm-conf TOPOLOGY-OPTIMIZE)
                               (optimize-topology topology)
                               topology)
                    storm-cluster-state (:storm-cluster-state nimbus)] ;;操作zk的interface
                (system-topology! total-storm-conf topology) ;; this validates the structure of the topology, 1. System-topology!
                (log-message "Received topology submission for " storm-name " with conf " storm-conf)
                ;; lock protects against multiple topologies being submitted at once and
                ;; cleanup thread killing topology in b/w assignment and starting the topology
                (locking (:submit-lock nimbus)
                  (setup-storm-code conf storm-id uploadedJarLocation storm-conf topology) ;;2. 建立topology的本地目录
                  (.setup-heartbeats! storm-cluster-state storm-id) ;;3. 建立Zookeeper heartbeats
                  (start-storm nimbus storm-name storm-id)  ;;4. start-storm
                  (mk-assignments nimbus))) ;;5. mk-assignments

              (catch Throwable e
                (log-warn-error e "Topology submission exception. (topology name='" storm-name "')")
                (throw e))))


Details:

1. System-topology!

  Validate Topology, 比如使用的comonentid, steamid是否合法 
  添加系统所需要的component, 比如acker等, 不过没有用到, 不知道为什么要调用System-topology!
  
          (system-topology! total-storm-conf topology) ;; this validates the structure of the topology
          (defn system-topology! [storm-conf ^StormTopology topology]
            (validate-basic! topology)
            (let [ret (.deepCopy topology)]
              (add-acker! storm-conf ret)
              (add-metric-components! storm-conf ret)    
              (add-system-components! storm-conf ret)
              (add-metric-streams! ret)
              (add-system-streams! ret)
              (validate-structure! ret)
              ret
              ))

2. 建立topology的本地目录 (这步开始需要lock互斥)

  Jars and configs are kept on local filesystem because they're too big for Zookeeper. The jar and configs are copied into the path {nimbus local dir}/stormdist/{topology id}
  
  (setup-storm-code conf storm-id uploadedJarLocation storm-conf topology)
  借用这张图, 比较清晰, 先创建目录, 并将Jar move到当前目录
  再将topology对象和conf对象都序列化保存到目录中

3. 建立Zookeeper heartbeats

  就是按照下面图示在Zookeeper建立topology的心跳目录
  
          (.setup-heartbeats! storm-cluster-state storm-id)
           
          (setup-heartbeats! [this storm-id]
            (mkdirs cluster-state (workerbeat-storm-root storm-id)))
          
          (defn mkdirs [^CuratorFramework zk ^String path]
            (let [path (normalize-path path)]
              (when-not (or (= path "/") (exists-node? zk path false))
                (mkdirs zk (parent-path path))
                (try-cause
                  (create-node zk path (barr 7) :persistent)
                  (catch KeeperException$NodeExistsException e
                    ;; this can happen when multiple clients doing mkdir at same time
                    ))
                )))

4. start-storm, 产生StormBase

  虽然叫做start-storm, 其实做的事情只是把StormBase结构序列化并放到zookeeper上 
  这个StormBase和topology对象有什么区别, 
  topology对象, topology的静态信息, 包含components的详细信息和之间的拓扑关系, 内容比较多所以存储在磁盘上stormcode.ser 
  而StormBase, topology的动态信息, 只记录了launch时间, status, worker数, component的executor数运行态数据, 比较mini, 所以放在zk上
  
          (defn- start-storm [nimbus storm-name storm-id]
            (let [storm-cluster-state (:storm-cluster-state nimbus)
                  conf (:conf nimbus)
                  storm-conf (read-storm-conf conf storm-id)
                  topology (system-topology! storm-conf (read-storm-topology conf storm-id))
                  num-executors (->> (all-components topology) (map-val num-start-executors))]
              (log-message "Activating " storm-name ": " storm-id)
              (.activate-storm! storm-cluster-state
                                storm-id
                                (StormBase. storm-name
                                            (current-time-secs)
                                            {:type :active}
                                            (storm-conf TOPOLOGY-WORKERS)
                                            num-executors))))
          
          ;; component->executors is a map from spout/bolt id to number of executors for that component
          (defrecord StormBase [storm-name launch-time-secs status num-workers component->executors])
           
          struct ComponentCommon {
            1: required map<GlobalStreamId, Grouping> inputs;
            2: required map<string, StreamInfo> streams; //key is stream id
            3: optional i32 parallelism_hint; //how many threads across the cluster should be dedicated to this component
            4: optional string json_conf;
          }

  从上面可以看出StormBase是定义的一个record, 包含storm-name, 当前时间戳, topology的初始状态(active或inactive), worker数目, 和executor的数目 
  其中计算num-executors, 使用->>, 其实等于(map-val num-start-executors (all-components topology)), map-value就是对(k,v)中的value执行num-start-executors, 而这个函数其实就是去读ComponentCommon里面的parallelism_hint, 所以num-executors, 描述每个component需要几个executors(线程)

        (activate-storm! [this storm-id storm-base]
          (set-data cluster-state (storm-path storm-id) (Utils/serialize storm-base))
          )
        (defn storm-path [id]
          (str STORMS-SUBTREE "/" id)) ;/storms/id
         
        (defn set-data [^CuratorFramework zk ^String path ^bytes data]
          (.. zk (setData) (forPath (normalize-path path) data)))

  最终调用activate-storm!将storm-base序列化后的数据存到Zookeeper的"/storms/id”目录下 
5. mk-assignments
