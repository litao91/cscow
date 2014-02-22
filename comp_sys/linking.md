# Linking
Most compilation systems provide a compiler driver that invokes:

* Language preprocessor
* Compiler
* Assembler
* Linker

Example:

    gcc -O2 -g -o p main.c swap.c

The driver do the following:

1. It first runs the C preprocessor `cpp`, translate `main.c` into an
   ASCII intermediate file `main.i`:

        cpp [other arguments] main.c /tmp/main.i

2. The driver runs the C compiler `cc1` translate `main.i` to assembly
   language file `main.s`

        cc1 /tmp/main.i main.c -O2 [other arguments] -o /tmp/main.s

3. Then, the driver runs the assembler (`as`), which translates `main.s`
   into a *relocatable object file* `main.o`:

        as [other arguments] -o /tmp/main.o /tmp/main.s

4. The drier go through the same process to generate `swap.o`. 
5. Finally, it runs the linker program `ld`, which combines `main.o` and
   `swap.o`, to create the *executable object file* p:

        ld -o p [system object files and args] /tmp/main.o /tmp/swap.o

## Static Linking
Static Linker take as input a collection of relocatable object files and
command-line arguments and generate as output a **fully linked
executable** object file that can be loaded and run.

Input object files consist of various code and data sections, the linker
must perform two main tasks:

* *symbol resolution*: associate each symbol reference with exactly one
  symbol definition.
* *Relocation*: Compiler and assemblers generate code and data sections
  that start at address 0. The linker relocates sections by associating a
  memory location with each symbol definition, and then modifying all of
  the references to those symbols so that they point to this memory
  location. 


## Symbol Resolution
The linker resolves symbol references by associating each reference with
exactly one symbol definition from the symbol tables of its input
relocatable object files.

### Linking with Static Libraries
All compilation systems provide a mechanism for packing related object
modules into a single file called a *static library*, which can then be
supplied as input to the linker. 

When it builds the output executable, the linker copies *only the object
modules in the library that are referenced* by the application program.

In static library, related functions can be compiled into separate object
modules and then **packaged in single static library file**.

Application programs can then use any of the functions defined in the
library by specifying a single file name on the command line. Example:

    gcc main.c /usr/lib/libm.a /usr/lib/libc.a

At link time, the linker will only copy the object modules that are
referenced by the program.

---

On Unix systems, static libraries are stored on disk in a particular file
format known as *archive* , denoted with a `.a` suffix.

To create the library:

    gcc -c addvec.c multvec.c
    ar rcs libvector.a addvec.o multvec.o

To use it:

```c
#include <stdio.h>
#inlcude "vector.h"

int x[2] = {1, 2};
int y[2] = {3, 4};
int z[2];

int main() {
    addvec(x, y, z, 2);
    printf("z = [%d %d]\n", z[0], z[1]);
    return 0;
}
```

To build:

    gcc -O2 -c main.c
    gcc -static -o p2 main.o ./libvector.a

---

Note: if the libraries are not independent, then they must be ordered so
that for each symbol `s`, at least one of definition of `s` follows a
reference to `s` on the command line.

For example, suppose `foo.c` calls function in `libx.a` and `libz.a` that
call functions in `liby.a`. Then `libx.a` and `libz.a` must precede
`liby.a` on the command line:

    gcc foo.c libx.a libz.a liby.a


## Dynamic Linking with Shared Libraries
A shared library is an object module that, *at run time*, can be loaded
at an arbitrary memory address and linked with a program in memory.
The process is known as *dynamic linking* and is performed by a program
called a *dynamic linker*.

Shared libraries are shared in two different ways:

* First, any given file system, there is exactly one `.so` file for
  particular library. The code and data in this `.so` are shared by all of
  the executable object files hat reference the library. As opposed to
  static libraries that are **copied and embedded** in executable
* Second, a single copy of the `.text` section of a shared library in
  memory can be shared by different running processes.


To build a shared library:

    gcc -shared -fPIC -o libvector.so addvec.c multvec.c

The `-fPIC` flag directs the compiler to generate position-independent
code. The `-shared` flag directs the linker to create a shared object
file.

Then link it into our example:

    gcc -o p main.c ./libvector.so

This creates an executable object file `p` in a form that *can be linked
with `libvector.so`* at runtime.

The idea is to do some of the linking statically when the executable file
is created, and then complete the linking process dynamically when the
program is loaded. Note that none of the code or data sections from
`libvector.so` are actually copied into the executable `p`.

When the loader loads and runs the executable `p`, it loads the partially
linked executable `p`. Next, it notices that `p` contains a `.interp`
section, which contains the path name of the dynamic linker,
(`ld-linux.so` on linux). Instead of passing control to the application,
the loader loads and runs the dynamic linker. 

The linker do:

* Relocating the text and data of `libc.so` into some memory segment
* Relocating the text and data of `libvector.so` into another memory
  segment
* Relocating any references in `p` to symbols defined by `libc.so` and
  `libvector.so`

Finally, the dynamic linker passes control to the application.

## Loading and Linking Shared Libraries from Applications
It is also possible for an application to request the dynamic linker to
load and link arbitrary shared libraries while the application is running,
without having to link the applications against libraries at compile time.

Linux provide a simple interface to the dynamic linker that allows
application programs to load and link shared library at run time:

```c
#include <dlfcn.h>
void *dlopen(const char* filename, int flag);
// Return ptr to handle if OK, NULL on error
```

The `dlsym` takes a handle to a previously opened shared library and a
`symbol` name, and returns the address of the symbol:

```c
#include <dlfcn.h>
void *dlsym(void* handle, char* symbol);
```

Unload the shared library:
```c
#include <dlfcn.h>
int dlclose(void* handle);
```

Returns a string describing the most recent error:
```c
#include <dlfcn.h>
const char* dlerror(void);
```


A full example:

```c
#include <stdio.h>
#include <stdlib.h>
#include <dlfcn.h>

int x[2] = {1, 2};
int y[2] = {3, 4};
int z[2];


int main() {
    void *handle;
    void (*addvec)(int*, int*, int*, int);
    char* error;

    handle = dlopen("./libvector.so", RTLD_LAZY);

    if(!handle) {
        fprintf(stderr, "%s\n", dlerror());
        exit(1);
    }

    addvec = dlsym(handle, "addvec");
    if((error = dlerror()) != NULL) {
        fprintf(stderr, "%s\n", error);
        exit(1);
    }

    addvec(x, y, z, 2);
    printf("z = [%d %d]\n", z[0], z[1]);

    if(dlclose(handle) < 0 ) {
        fprintf(stderr, "%s\n", dlerror());
        exit(1);
    }

    return 0;
}



