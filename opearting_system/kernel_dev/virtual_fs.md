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
A *filesystem* is a hierarchicla storage of data adhering to a specific
structure. It contains:

* **Files**: ordered string of bytes. Assigned a human readable name for
  identification by both the system and the user.
* **Directories**: Files are organized in directories. Each component of a
  path is called a *directory entry*. In Unix, directories are actually
  normal files that simply list the files contained therein.
* **Associated control information**: Unix separate the concept of file from
  any associated information about it. This information is called *file
  metadata*, and is stored in a separate data structure from the file,
  called the *inode* (short for *index node*) .

In Unix, FSs are mounted at a specific mount point in a global hierarchy
known as a *namespace*. This enables all mounted filesystems to appear as
entries in a **single tree**.

All information is tied together with the filesystem's own control
information, which is stored in *superblock*. The superblock is a data
structure containing information about the filesystem as a whole
(*filesystem metadata*).

Traditionally, Unix FS implement these notion as a part of their physical
on-disk layout. For example, file information is stored as an inode in a
separate block on the disk; directories are files; control information is
is stored centrally in a superblock.

The Unix file concepts are *physically mapped* on to the storage medium.
The Linux VFS is designed to work with filesystems that understand and
implement such concepts.

For example, even if a filesystem does not support distinct inodes, it
must assemble the inode data structure in memory as
if it did.

## VFS Objs and Data Structures
The VFS is object-oriented, because the kernel is strictly in C, the data
structure are represented as C structures.

The four primary object types of the VFS:

* The **superblock**, which represent a specific mounted FS
* The **inode** object, which represent a specific file.
* The **dentry** object, which represents a directory, which is a single
  component of a path
* The **file** object, which represents an open file as associated with a
  process.

Note: each component of a path is called a *directory entry*. A path
example is `/home/wolfman/butter`. The root directory `/`, the directories
`home` and `wolfman` and the file `butter` are all directories, called
`dentries`.

An *operation* obj is contained within each of these primary objects.
These objects describe the methods that the kernel invokes against the
primary objects:

* `super_operation`: methods that the kernel can invoke on a specific FS,
  such as `write_inode()` and `sync_fs()`.
* `inode_operations`: methods that kernel can invoke on a specific
  directory entry, such as `create()` and `link()`
* `dentry_operation`, invoke on a specific directory entry, such as
  `d_compare()` and `d_delete()`.
* The `file_operations` object, methods that a process can invoke on an
  open file, such as `read()` and `write()`.

Note: the *objects* refer to structures. These structures, however,
represent specific instances of an object, their associated data, and
methods to operate on themselves.

## The Superblock Object
The superblock object is implemented by each filesystem and is used to store
**information describing that specific filesystem**.

This object is usually corresponds to the *filesystem superblock* or the
*filesystem control block*, which is stored in a special sector on disk.
Filesystems that are not disk-based generate the superblock on-the-fly and
store it in memory.

The superblock object is represented by struct `super_block` and defined
in `<linux/fs.h>`:

```c
struct super_block {
    struct list_head s_list;               /* list of all superblocks */
    dev_t s_dev;                           /* identifier */
    unsigned long s_blocksize;             /* block size in bytes */
    unsigned char s_blocksize_bits;        /* block size in bits */
    unsigned char s_dirt;                  /* dirty flag */
    unsigned long long s_maxbytes;         /* max file size */
    struct file_system_type s_type;        /* filesystem type */

    struct super_operations s_op;          /* superblock methods */

    struct dquot_operations *dq_op;        /* quota methods */
    struct quotactl_ops *s_qcop;           /* quota control methods */
    struct export_operations *s_export_op; /* export methods */
    unsigned long s_flags;                 /* mount flags */
    unsigned long s_magic;                 /* filesystem’s magic number */
    struct dentry *s_root;                 /* directory mount point */
    struct rw_semaphore s_umount;          /* unmount semaphore */

    struct semaphore s_lock;               /* superblock semaphore */

    int s_count;                           /* superblock ref count */
    int s_need_sync;                       /* not-yet-synced flag */
    atomic_t s_active;                     /* active reference count */
    void *s_security;                      /* security module */
    struct xattr_handler  **s_xattr;       /* extended attribute handlers */
    struct list_head s_inodes;             /* list of inodes */
    struct list_head s_dirty;              /* list of dirty inodes */
    struct list_head s_io;                 /* list of writebacks */
    struct list_head s_more_io;            /* list of more writeback */
    struct hlist_head s_anon;              /* anonymous dentries */
    struct list_head s_files;              /* list of assigned files */
    struct list_head s_dentry_lru;         /* list of unused dentries */
    int s_nr_dentry_unused;                /* number of dentries on list */
    struct block_device *s_bdev;           /* associated block device */
    struct mtd_info *s_mtd;                /* memory disk information */
    struct list_head s_instances;          /* instances of this fs */
    struct quota_info s_dquot;             /* quota-specific options */
    int s_frozen;                          /* frozen status */
    wait_queue_head_t s_wait_unfrozen;     /* wait queue on freeze */
    char s_id[32];                         /* text name */
    void *s_fs_info;                       /* filesystem-specific info */
    fmode_t s_mode;                        /* mount permissions */
    struct semaphore s_vfs_rename_sem;     /* rename semaphore */
    u32 s_time_gran;                       /* granularity of timestamps */
    char *s_subtype;                       /* subtype name */
    char *s_options;                       /* saved mount options */
};
```

The code for creating, managing and destroying superblock objects lives in
`fs/super.c`. A superblock object is created and initialized via
`alloc_super()` function.

When mounted, a filesystem invokes this function, reads its superblock off
of the disk, and fills in this superblock object.

## Superblock Operations
The most important item in the object is `s_op`, which is a pointer to the
super block **operations table**. It is represented by `super_operations`
struct and is defined in `<linux/fs.h>`:


```c
struct super_operations {
    struct inode *(*alloc_inode)(struct super_block *sb);
    void (*destroy_inode)(struct inode *);
    void (*dirty_inode) (struct inode *);
    int (*write_inode) (struct inode *, int);
    void (*drop_inode) (struct inode *);
    void (*delete_inode) (struct inode *);
    void (*put_super) (struct super_block *);
    void (*write_super) (struct super_block *);
    int (*sync_fs)(struct super_block *sb, int wait);
    int (*freeze_fs) (struct super_block *);
    int (*unfreeze_fs) (struct super_block *);
    int (*statfs) (struct dentry *, struct kstatfs *);
    int (*remount_fs) (struct super_block *, int *, char *);
    void (*clear_inode) (struct inode *);
    void (*umount_begin) (struct super_block *);
    int (*show_options)(struct seq_file *, struct vfsmount *);
    int (*show_stats)(struct seq_file *, struct vfsmount *);
    ssize_t (*quota_read)(struct super_block *, int, char *, size_t, loff_t);
    ssize_t (*quota_write)(struct super_block *, int, const char *, size_t, loff_t);
    int (*bdev_try_to_free_page)(struct super_block*, struct page*, gfp_t);
};
```

Each item is a pointer to a function that operates on a superblock object.
They perform low-level operations on filesystem and inodes.

When a fs needs to perform an operation on its superblock, it follows the
pointers from its superblock object to the desired method. For example, if
a fs wanted to write to its superblock, it would invoke:

```c
sb->s_op->write_super(sb)
```

Some operations:

* `alloc_inode`: creates and initialize a new inode object under given sb.
* `destroy_inode`: deallocate the given inode
* `dirty_inode`: Invoke by VFS when the inode is dirtied (modified).
  Journaling fs such as ext3 and extr use this function to perform journal
  updates.
* `write_inode`: writes the given inode to disk.
* `drop_inode`: Called by the VFS when the last ref to an inode is
  dropped. VFS deletes the inode.
* `delete_inode`: deletes the given inode form the disk
* `put_super`: Called by VFS on unmount to release given superblock
  object. The caller must hold the `s_lock` lock.
* `write_super`: updates the on-disk superblock with specified superblock.
  The VFS uses this function to synchronize a modified in-memory
  superblock with the disk.
* `sync_fs`: synchronize the fs metadata with on-disk fs.
* `write_super_lockfs`: prevents changes to the filesystem, and then
  updates the on-disk superblock with the specified superblock.
* `statfs`: called by VFS to obtain filesystem statistics.

All the functions are invoked by the VFS

## The Inode Object
The inode object represents all information needed by the kernel to
manipulate a file or directory.

* Unix-style fs, this info is read from the on-disk inode
* If FS does not have inodes, fs must obtain the information from where
  ever it is stored on the disk.

The inode object is represented by `struct inode` and is defined in
`<linux/fs.h>`.

An inode represents each file on a fs, but the inode object is constructed
on the memory only as file are accessed.

## Inode Operations
The `inode_operations` member is important. It describes the fs's
implemented functions that the VFS can invoke on an inode. Example:

```c
i->i_op->truncate(i)
```

The `inode_operations` struct is defined in `<linux/fs.h>`

Some operations:

* `struct dentry* lookup(struct inode * dir, struct dentry *dentry)`: This
  function searches a directory for an inode corresponding to a filename
  specified in the given dentry.

## The Dentry Object
The VFS treats directories as a type of file. In path `/bin/vi`, both
`bin` and `vi` are files --- `bin` being the special directory file. An
inode object represents each of these components.

The VFS often needs to perform directory-specific operations, such as path
name lookup. Path name lookup involves translating each component of a
path, ensuring it is valid, and following it to the next coponent.

To facilitate this, the VFS employs the concept of directory entry
(dentry). A `dentry` is a specific component in a path.

Dentry objects are represented by `strct dentry` and defined in
`<linux/dcache.h>`.

```c
struct dentry {
    atomic_t d_count;                            /* usage count */
    unsigned int d_flags;                        /* dentry flags */
    spinlock_t d_lock;                           /* per-dentry lock */
    int d_mounted;                               /* is this a mount point? */
    struct inode *d_inode;                       /* associated inode */
    struct hlist_node d_hash;                    /* list of hash table entries */
    struct dentry *d_parent;                     /* dentry object of parent */
    struct qstr d_name;                          /* dentry name */
    struct list_head d_lru;                      /* unused list */
    union {
        struct list_head d_child;                /* list of dentries within */
        struct rcu_head d_rcu;                   /* RCU locking */
    } d_u;
    struct list_head d_subdirs;                  /* subdirectories */
    struct list_head d_alias;                    /* list of alias inodes */
    unsigned long d_time;                        /* revalidate time */
    struct dentry_operations *d_op;              /* dentry operations table */
    struct super_block *d_sb;                    /* superblock of file */
    void *d_fsdata;                              /* filesystem-specific data */
    unsigned char d_iname[DNAME_INLINE_LEN_MIN]; /* short name */
};
```

The dentry object does not correspond to any sort of on-disk data
structure. The VFS creates it on-the-fly from a string representation of a
path name.

### Dentry State
A valid dentry object can be in one of three states:

* **used**: corresponds to a valid inode, and indicates that there are one
  or more users of the object (`d_count` is positive). 
* **unused**: corresponds to a valid inode, but the VFS is not currently
  using the dentry object (`d_dount` is zero). The dentry need not to be
  recreated if it is needed in the future.
* **negative entry**: Not associated with a valid inode (`d_inode` is
  null).

### The Dentry Cache
The kernel caches dentry objects in the dentry cache or simply, the *dcache*

Three parts:

* List of used dentries linked off their associated inode via the
  `i_dentry` field of the inode object.
* A doubly linked "less recently used" list of unused and negative dentry
  objects.
* A hash table and hashing function used to quick resolve a given path
  into the associated dentry object. (`d_hash()` and `d_lookup()`)


Each time a path name is accessed, the VFS can first try to look up the
path name in the dentry cache. If the lookup succeeds, the required final
dentry object is obtained without serious effort. Otherwise, VFS must
follow each directory entry to resolve the full path.

## The file Object
The file object is used to represent a **file opened by a process.** 

It's the in-memory response to the `open()` system call and destroyed in
response to the `close()` system call. All these file-related calls are
actually methods defined in the file operations table.

Because multiple processes can open and manipulate a file at the same
time, there can be multiple file objects in existence for the same file.
The file object represents a **process's view of an open file**.

The file object is represented by `struct file` and is defined in
`<linux/fs.h>`

```c
struct file {
    union {
        struct list_head fu_list;    /* list of file objects */
        struct rcu_head fu_rcuhead;  /* RCU list after freeing */
    } f_u;
    struct path f_path;              /* contains the dentry */
    struct file_operations *f_op;    /* file operations table */
    spinlock_t f_lock;               /* per-file struct lock */
    atomic_t f_count;                /* file object’s usage count */
    unsigned int f_flags;            /* flags specified on open */
    mode_t f_mode;                   /* file access mode */
    loff_t f_pos;                    /* file offset (file pointer) */
    struct fown_struct f_owner;      /* owner data for signals */
    const struct cred *f_cred;       /* file credentials */
    struct file_ra_state f_ra;       /* read-ahead state */
    u64 f_version;                   /* version number */
    void *f_security;                /* security module */
    void *private_data;              /* tty driver hook */
    struct list_head f_ep_links;     /* list of epoll links */
    spinlock_t f_ep_lock;            /* epoll lock */
    struct address_space *f_mapping; /* page cache mapping */
    unsigned long f_mnt_write_state; /* debugging state */
};
```

Similar to the dentry object, the file object does not actually correspond
to any on disk data. The file object does point to its associated dentry
via `f_dentry`.

## File Operations

* `llseek()`: update the file pointer to the given offset
* `aio_read()`: asynchronous read of `count` bytes into `buf` for the file
  described in `iocb`.
* `ioctl(inode, file, cmd, arg)` sends a command and argument pair to a device. It is used when
  the file is an open device node. This function is called from the
  `ioctl()`.
* `mmap(file, vma)` maps the given file onto the given address space, and
  is called by `mmap()` system call.
* `int open(inode, file)` Creates a new file object and likes it to the
  corresponding inode object. It is called by the `open()` system call.
* `flush` called by the VFS whenever the reference count of a open file
  decreases. 
* `fsync` called by `fsync()` system call to write all cached data for the
  file to disk.


Note: Because BKL (Big Kernel Lock) is a coarse-grained, inefficient lock,
drivers should implement `unlock_ioctl()` and not `ioctl()`.

## Data Structure Associated with Filesystems
Linux kernel have a special structure for **describing the capabilities
and behavior of each filesystem**. The structure `file_system_type`
structure, defined in `<linux/fs.h>` accomplishes this.

The `get_sb()` function reads the superblock from the disk and populates
the superblock object when the filesystem is loaded. 

There is only one `file_system_type` per filesystem, regardless of how
many instances of the filesystem are mounted on the system.

When filesystem is actually mounted, at which point the `vfsmount`
strucuture is created. This structure represents a specific instance fo a
filesystem --- in other words, a mount point.

The `vfsmount` strucuture is defined in `<linux/mount.h>`. The complicated
part of maintaining the list of all mount points is the relation between
the filesystem and all the other mount points. The various linked list in
`vfsmount` keep track of this information.

## Data Structure Associated with Process
Each process on the system has its own list of open files, root
filesystem, current working directory, mount points, and so on.

The data structure tie together the VFS layer and the processes on the
system: 

* `files_struct` --- defined in `<linux/fdtable.h>`, pointed to by teh
  `file` entry in the process descriptor. All per-process information
  about open files and file descriptor is contained therein.
* `fs_struct` --- Contains filesystem information related to a process and
  is pointed at by the `fs` field in the process descriptor. defined in
  `<linux/fs_struct.h>`. This structure holds the current working
  directory (`pwd`) and root directory of the current process.
* `namespace` --- Defined in `<linux/mnt_namespace.h>` and pointed by the
  `mnt_namespace` field in the process descriptor. They enable each
  process to have a unique view of the mounted filesystems on the system.
