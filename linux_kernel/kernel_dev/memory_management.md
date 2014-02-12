# Memory Management
## Pages
The kernel treats physical pages as the basic unit of memory management.
MMU typically deals in pages. MMU maintains the system's page tables with
page-sized granularity.

The kernel represents *every* physical page on the system with a `struct
page` structure, defined in `<linux/mm_types.h>`. A simplified version of
definition:

    struct page {
        unsigned long flags;
        atomic_t _count; 
        atomic_t _mapcount; 
        unsigned long private; 
        struct address_space *mapping; 
        pgoff_t index; 
        struct list_head lru; 
        void *virtual;
    };

* `flags` status of the page, whether the page is dirty or whether it is
  locked in memory. Flags are defined in `<linux/page-flags.h>`.
* `_count` stores the usage count of the page -- how may references there
  are to this page. When this count reaches negative one, no one is using
  the page and it becomes ready for use in a new allocation. Kernel code
  should use the function `page_count()` to check this field, which take a
  `page` structure as its solo parameter.
* The `virtual` field is the page's virtual address.

The important point is that `page` structure is associated with physical
pages, not virtual pages. 

The kernel uses this structure to keep track of all the pages in the
system, because the kernel needs to know whether a page is free. If a page
is not free, the kernel needs to know who owns the page. Possible owners
include user-space processes, dynamically allocated kernel data, static
kernel code, the page cache, and so on.

An instance of this structure is allocated for each physical page in the
system.

## Zones
Zones are defined in `<linux/mmzone.h>`, four primary memory zones:

* `ZONE_DMA` -- pages that can undergo DMA
* `ZONE_DMA32` -- accessible only by 32-bit devs
* `ZONE_NORMAL`-- normal, regularly mapped pages
* `ZONE_HIGHMEM` -- "high-memory", pages not permanently mapped into
  kernel's address space.

Linux partitions the system’s pages into zones to have a pooling in place
to satisfy allocations as needed.

Each zone is represented by `struct zone`

    struct zone { 
        unsigned long watermark[NR_WMARK]; 
        unsigned long lowmem_reserve[MAX_NR_ZONES]; 
        struct per_cpu_pageset pageset[NR_CPUS]; 
        spinlock_t lock;
        struct free_area free_area[MAX_ORDER] 
        spinlock_t lru_lock; 
        struct zone_lru {
        struct list_head list; 
        unsigned long nr_saved_scan;
        } lru[NR_LRU_LISTS]; 
        struct zone_reclaim_stat reclaim_stat; 
        unsigned long pages_scanned; 
        unsigned long flags; 
        atomic_long_t vm_stat[NR_VM_ZONE_STAT_ITEMS]; 
        int prev_priority; 
        unsigned int inactive_ratio; 
        wait_queue_head_t *wait_table; 
        unsigned long wait_table_hash_nr_entries; 
        unsigned long wait_table_bits; 
        struct pglist_data *zone_pgdat; 
        unsigned long zone_start_pfn; 
        unsigned long spanned_pages; 
        unsigned long present_pages; 
        const char *name;
    }; 

* `lock` -- a spin lock that protects the structure from concurrent access
* `watermark` -- minimum, low and high watermarks for this zone. 
* `name` -- name of this zone.
