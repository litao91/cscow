# The Virtual Filesystem
VFS enables programs to use standard Unix system calls to read and write
to different filesystems.

Together, the VFS and the block I/O layer provide the abstractions,
interfaces, and glue that allow user-space programs to issue generic
system calls to access files via a uniform naming policy on any
filesystem, which itself exists on any storage medium.

VFS provides a common file model that can represent any filesystem's
general feature set and behavior.

The abstraction layer works by defining the basic conceptual interfaces
and data structures that all filesystems support.

## Unix Filesystems
