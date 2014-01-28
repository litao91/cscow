# Zookeeper
## ZooKeeper Overview
ZooKeeper allows distributed processes to coordinate with each other
through a shared hierarchical name space of data registers, much like a
file system.

The name space provided by ZooKeeper is much like that of a standard file
system. A name is a sequence of path elements separated by a slash("/").
Every znode in ZooKeeper's name space is identified by a path.

The main differences between ZooKeeper and standard file systems are
that every znode can have data associated with it (every file can also be
a directory and vice-versa) and znodes are limited to the amount of data
that they can have. 

ZooKeeper was designed to store coordination data: status information,
configuration, location information, etc. This kind of meta-information is
usually measured in kilobytes, if not bytes. ZooKeeper has a built-in
sanity check of 1M, to prevent it from being used as a large data store,
but in general it is used to store much smaller pieces of data.

![](figures/service.png)

The service itself is replicated over a set of machines that comprise the
service. These machines maintain an in-memory image of the data tree along
with a transaction logs and snapshots.

The servers that make up the ZooKeeper service must all know about each
other. As long as a majority of the servers are available, the ZooKeeper
service will be available. Clients must also know the list of servers. The
clients create a handle to the ZooKeeper service using this list of
servers.

1. Clients only connect to a single ZooKeeper server. 
    - The client maintains a TCP connection through which it sends requests,
      gets responses, gets watch events, and sends heartbeats.
    - If the TCP connection to the server breaks, the client will connect to a
      different server. When a client first connects to the ZooKeeper service,
      the first ZooKeeper server will steup a session for the client.
* Read request sent by ZooKeeper **client** are processed locally at the
  ZooKeeper server to which the client is connected.
* Write requests are forwarded to toher ZooKeeper servers adn go through
  consensus before a response is generated. 
* Sync requests are also forwarded to another server, but do not actually
  go through consensus.


Order is very important to ZooKeeper; almost bordering on
obsessive–compulsive disorder. All updates are totally ordered. ZooKeeper
actually stamps each update with a number that reflects this order. We
call this number the zxid (ZooKeeper Transaction Id). Each update will
have a unique zxid. Reads (and watches) are ordered with respect to
updates. Read responses will be stamped with the last zxid processed by
the server that services the read.

## ZNodes
Every node in a ZooKeeper is referred to as a *znode*.  Znodes maintain a
stat structure that includes version number for data changes, acl changes.

Each time a znode's data changes, the version number increases.

For instance, whenever a client retrieves data, it also receives the
version of the data. And when a client performs an update or a delete, it
must supply the version of the data of the znode it is changing. If the
version it supplies doesn't match the actual version of the data, the
update will fail. 

### Watches
Clients can set watches on znodes. Changes trigger the watch and then
clear the watch. When a watch triggers, ZooKeeper sends the client a
notification.

### Data Access
The data stored at each znode in a namespace is read and written
atomically. Reads get all the data bytes associated with a znode and a
write replaces all the data. Each node has an Access Control List (ACL)
that restricts who can do what.

ZooKeeper manages coordination data. If a large data storage is neede, the
usually pattern of dealing with such data is to store it on a bulk storage
system, and store pointers to the storage location in ZooKeeper.

### Ephemeral Nodes
Exists as long as the session that created the znode is active. When the
session ends the znode is deleted.

### Sequence Nodes -- Unique Naming
When creating a znode you can also request that ZooKeeper append a
monotonically increasing counter to the end of path. This counter is
unique to the parent znode.

## ZooKeeper Sessions
A ZooKeeper client establishes a session with the ZooKeeper service by
creating a handle to the service using a language binding. 

1. Once created, the handle starts of in the CONNECTING state 
* and the client library tries to connect to one of the servers that make
  up the ZooKeeper service at which point it switches to the CONNECTED
  state. 
* During normal operation will be in one of these two states. If an
  unrecoverable error occurs, such as session expiration or authentication
  failure, or if the application explicitly closes the handle, the handle
  will move to the CLOSED state

To create a client session the application code must provide a connection
string containing a comma separated list of host:port pairs, each
corresponding to a ZooKeeper server (e.g. "127.0.0.1:4545" or
"127.0.0.1:3000,127.0.0.1:3001,127.0.0.1:3002"). The ZooKeeper client
library will pick an arbitrary server and try to connect to it. If this
connection fails, or if the client becomes disconnected from the server
for any reason, the client will automatically try the next server in the
list, until a connection is (re-)established.

## ZooKeeper Watches
All of the read operations in ZooKeeper - getData(), getChildren(), and
exists() - have the option of setting a watch as a side effect. Here is
ZooKeeper's definition of a watch: a watch event is one-time trigger, sent
to the client that set the watch, which occurs when the data for which the
watch was set changes.
