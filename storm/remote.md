Remote Mode
==========
LocalCluster VS StormSumitter
-----------------------------
One of the interesting features of storm is that it's easy to send your
topology to run in a real cluster.

You'll need to change the `LocalCluster` to a `StormSubmitter`.

Example:
    
    StormSubmitter.submitTopology("Count-Word-Topology-With-Refresh-Cache",
        conf, builder.createTopology());

Next Package the source into a jar, which is sent when you run the Strom
Client command to submit the topology.
    
    mvn package

`storm jar` command to submit the topology, syntax:
    storm jar allmycode.jar org.me.MyTopology arg1 arg2 arg3

Example: 
    storm jar target/Topologies-0.0.1-SNAPSHOT.jar countword.TopologyMain src/main/
        resources/words.txt

To stop it:
    storm kill Count-Word-Topology-With-Refresh-Cache

DRPC Topologies
---------------
DRPC: Distributed Remote Procedure Call, execute *Remote Procedure Calls*
(RPC) using the distributed power of Storm.

Tools to enable DRPC:
1. DRPC server that runs as a connector between the client and storm
   topology. 
   - As a source for the topology spout.
   - Receives a function to execute and its parameters
   - For each piece of data on which the function operates, the server
     assigns a request ID used through the topology to identify the RPC
     request.
   - When the topology executes last bolt, it must emit the PRC request ID
     and the result. allow the DRPC server to return the result.
 2. `LinearDRPCTopologyBuilder`: an abstraction to help build DRPC
    topologies.
    - Generates `DRPCSpout`, connect to DRPC servers and emit data to the
      rest of the topology, wraps the bolts so that a result is returned
      from the last bolt.
    - All bolts added to a `LinearDRPCTopologyBuilder`
