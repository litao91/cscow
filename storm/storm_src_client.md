Storm Client
=============
Use storm to start topology, as follow:

    storm jar storm-starter-0.0.1-SNAPSHOT-standalone.jar storm.starter.WordCountTopology

这个storm命令是用python实现的, 看看其中的jar函数, 很简单,
调用`exec_storm_class`, 其中`jvmtype="-client"`
而`exec_storm_class`其实就是拼出一条java执行命令,
然后用`os.system`(command)去执行

这儿的klass就是topology类, 所以java命令只是调用Topology类的main函数

    def jar(jarfile, klass, *args):
        """Syntax: [storm jar topology-jar-path class ...]

    Runs the main method of class with the specified arguments.
    The storm jars and configs in ~/.storm are put on the classpath.
    The process is configured so that StormSubmitter
    (http://nathanmarz.github.com/storm/doc/backtype/storm/StormSubmitter.html)
    will upload the jar at topology-jar-path when the topology is submitted.
    """
        exec_storm_class(
            klass,
            jvmtype="-client",
            extrajars=[jarfile, CONF_DIR, STORM_DIR + "/bin"],
            args=args,
            childopts="-Dstorm.jar=" + jarfile)

    def exec_storm_class(klass, jvmtype="-server", childopts="", extrajars=[], args=[]):
        nativepath = confvalue("java.library.path", extrajars)
        args_str = " ".join(map(lambda s: "\"" + s + "\"", args))
        command = "java" + jvmtype + " -Dstorm.home=" + STORM_DIR + " " + get_config_opts() + " -Djava.library.path=" + nativepath + " " + childopts + " -cp" + get_classpath(extrajars) + " " + klass + " " + args_str
        print "Running:" + command
        os.system(command)

The `main()` method in `WordCountTopology`:

* Define topology
* Call `StormSubmitter.submitTopology(args[0], conf, builder.createTopology())` to submit topology

    public static void main(String[] args) throws Exception {        
        TopologyBuilder builder = new TopologyBuilder();        
        builder.setSpout("spout", new RandomSentenceSpout(), 5);        
        builder.setBolt("split", new SplitSentence(), 8)
                 .shuffleGrouping("spout");
        builder.setBolt("count", new WordCount(), 12)
                 .fieldsGrouping("split", new Fields("word"));

        Config conf = new Config();
        conf.setDebug(true);

        if(args!=null && args.length > 0) {
            conf.setNumWorkers(3);            
            StormSubmitter.submitTopology(args[0], conf, builder.createTopology());
        } else {        
            conf.setMaxTaskParallelism(3);
            LocalCluster cluster = new LocalCluster();
            cluster.submitTopology("word-count", conf, builder.createTopology());   
            Thread.sleep(10000);
            cluster.shutdown();
        }
    }

## StormSubmitter

直接看看submitTopology, 

1. **配置参数**:

   - 把命令行参数放在stormConf
   - 从conf/storm.yaml读取配置参数到conf
   - 再把stormConf也put到conf, 可见命令行参数的优先级更高 

   *将stormConf转化为Json*, 因为这个配置是要发送到服务器的

2. **Submit Jar**

    *StormSubmitter的本质是个Thrift Client, 而Nimbus则是Thrift Server*, 所以所有的操作都是通过Thrift RPC来完成
    先判断topologyNameExists, 通过Thrift client得到现在运行的topology的状况, 并check 
    然后Submit Jar, 通过底下三步

    - `client.getClient().beginFileUpload();`
    - `client.getClient().uploadChunk(uploadLocation, ByteBuffer.wrap(toSubmit));`
    - `client.getClient().finishFileUpload(uploadLocation);`

    把数据通过RPC发过去, 具体怎么存是nimbus自己的逻辑的事...

3. Submit Topology 

    很简单只是简单的调用RPC 

        `client.getClient().submitTopologyWithOpts(name, submittedJar, serConf, topology, opts);`

        /**
         * Submits a topology to run on the cluster. A topology runs forever or until 
         * explicitly killed.
         *
         *
         * @param name the name of the storm.
         * @param stormConf the topology-specific configuration. See {@link Config}. 
         * @param topology the processing to execute.
         * @param options to manipulate the starting of the topology
         * @throws AlreadyAliveException if a topology with this name is already running
         * @throws InvalidTopologyException if an invalid topology was submitted
         */
        public static void submitTopology(String name, Map stormConf, StormTopology topology, SubmitOptions opts) throws AlreadyAliveException, InvalidTopologyException {
            if(!Utils.isValidConf(stormConf)) {
                throw new IllegalArgumentException("Storm conf is not valid. Must be json-serializable");
            }
            stormConf = new HashMap(stormConf);
            stormConf.putAll(Utils.readCommandLineOpts());
            Map conf = Utils.readStormConfig();
            conf.putAll(stormConf);
            try {
                String serConf = JSONValue.toJSONString(stormConf);
                if(localNimbus!=null) {
                    LOG.info("Submitting topology " + name + " in local mode");
                    localNimbus.submitTopology(name, null, serConf, topology);
                } else {
                    NimbusClient client = NimbusClient.getConfiguredClient(conf);
                    if(topologyNameExists(conf, name)) {
                        throw new RuntimeException("Topology with name `" + name + "` already exists on cluster");
                    }
                    submitJar(conf);
                    try {
                        LOG.info("Submitting topology " +  name + " in distributed mode with conf " + serConf);
                        if(opts!=null) {
                            client.getClient().submitTopologyWithOpts(name, submittedJar, serConf, topology, opts);                    
                        } else {
                            // this is for backwards compatibility
                            client.getClient().submitTopology(name, submittedJar, serConf, topology);                                            
                        }
                    } catch(InvalidTopologyException e) {
                        LOG.warn("Topology submission exception", e);
                        throw e;
                    } catch(AlreadyAliveException e) {
                        LOG.warn("Topology already alive exception", e);
                        throw e;
                    } finally {
                        client.close();
                    }
                }
                LOG.info("Finished submitting topology: " +  name);
            } catch(TException e) {
                throw new RuntimeException(e);
            }
        }
