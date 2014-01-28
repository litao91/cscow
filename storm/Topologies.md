Topologies
==========
Stream Grouping
---------------
Defining how data is exchanged between components.
* Specifies which stream(s) are consumed by each `bolt` and how the stream
  will be consumed
* A node can emit more than one stream of data. A stream grouping allows
  us to choose which stream to receive.

Example:

    builder.setBolt("word-normalizer", new WordNormalizer())
        .shuffleGrouping("word-reader");

* A stream grouping takes the source component ID as parameter.
* There can be more than one source per `InputDeclarer`, and each source
  can be grouped with different stream grouping.

Different groupings:
* **Shuffle Grouping**: takes the source component as parameter, and sends
  each tuple emitted by the source to a randomly chosen bolt. Warranting
  that each consumer will receive the same number of tuples. Useful for
  *atomic* operations.
* **Fields Grouping**: It guarantee that a given set of values for a
  combination of fields is always  sent to the same bolt. In word count
  example, if you group the stream by word field, the word-normalizer wil
  always send tuples with a given word to the same instance of the
  `word-counter` bolt.
* **All Grouping**: send a single copy of each tuple to all instances of
  the receiving bolt. Send *signals* to bolts.
* **Custom Grouping**: Create your own grouping by implementing the
  `backtype.storm.grouping.CustomStreamGrouping`.


Details
-------
Define a new spout:


    /**
     * Define a new spout in this topology with the specified parallelism. If the spout declares
     * itself as non-distributed, the parallelism_hint will be ignored and only one task
     * will be allocated to this component.
     *
     * @param id the id of this component. This id is referenced by other components that want to consume this spout's outputs.
     * @param parallelism_hint the number of tasks that should be assigned to execute this spout. Each task will run on a thread in a process somwehere around the cluster.
     * @param spout the spout
     */
    public SpoutDeclarer setSpout(String id, IRichSpout spout, Number parallelism_hint) {
        validateUnusedId(id);
        initCommon(id, spout, parallelism_hint);
        _spouts.put(id, spout);
        return new SpoutGetter(id);
    }

Define a new bolt in topology, defined in `TopologyBuilder.setBolt()`:

    private Map<String, IRichBolt> _bolts = new HashMap<String, IRichBolt();
    ...

     * Define a new bolt in this topology with the specified amount of parallelism.
     *
     * @param id the id of this component. This id is referenced by other components that want to consume this bolt's outputs.
     * @param bolt the bolt
     * @param parallelism_hint the number of tasks that should be assigned to execute this bolt. Each task will run on a thread in a process somewhere around the cluster.
     * @return use the returned object to declare the inputs to this component
     */
    public BoltDeclarer setBolt(String id, IRichBolt bolt, Number parallelism_hint) {
        validateUnusedId(id);
        initCommon(id, bolt, parallelism_hint);
        _bolts.put(id, bolt);
        return new BoltGetter(id);
    }

Creating a new topology, in `TopologyBuilder.createTopology()`:


    public StormTopology createTopology() {
        Map<String, Bolt> boltSpecs = new HashMap<String, Bolt>();
        Map<String, SpoutSpec> spoutSpecs = new HashMap<String, SpoutSpec>();
        for(String boltId: _bolts.keySet()) {
            IRichBolt bolt = _bolts.get(boltId);
            ComponentCommon common = getComponentCommon(boltId, bolt);
            boltSpecs.put(boltId, new Bolt(ComponentObject.serialized_java(Utils.serialize(bolt)), common));
        }
        for(String spoutId: _spouts.keySet()) {
            IRichSpout spout = _spouts.get(spoutId);
            ComponentCommon common = getComponentCommon(spoutId, spout);
            spoutSpecs.put(spoutId, new SpoutSpec(ComponentObject.serialized_java(Utils.serialize(spout)), common));
            
        }
        return new StormTopology(spoutSpecs,
                                 boltSpecs,
                                 new HashMap<String, StateSpoutSpec>());
    }

Note that `BotGetter extends ConfigGetter<BoltDeclarer> implements
BoltDeclarer`, and `BoltGetter.shuffleGrouping()` defined as follow:


    public BoltDeclarer shuffleGrouping(String componentId, String streamId) {
        return grouping(componentId, streamId, Grouping.shuffle(new NullStruct()));
    }


The grouping function defined as (`TopologyBuilder.BoltGetter.grouping()`)

    private BoltDeclarer grouping(String componentId, String streamId, Grouping grouping) {
        _commons.get(_boltId).put_to_inputs(new GlobalStreamId(componentId, streamId), grouping);
        return this;
    }

In which the `_commons` defined in `TopologyBuilder` as:
    
    private Map<String, ComponentCommon> _commons = new HashMap<String, ComponentCommon>();

Where the commons sets the input, as shown in
`TopologyBuilder.initCommon()`:

    private void initCommon(String id, IComponent component, Number parallelism) {
        ComponentCommon common = new ComponentCommon();
        common.set_inputs(new HashMap<GlobalStreamId, Grouping>());
        if(parallelism!=null) common.set_parallelism_hint(parallelism.intValue());
        Map conf = component.getComponentConfiguration();
        if(conf!=null) common.set_json_conf(JSONValue.toJSONString(conf));
        _commons.put(id, common);
    }
