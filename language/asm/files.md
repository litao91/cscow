# Dealing with Files
## The UNIX File Concept
 UNIX files, no matter what program created them, can all be accessed as a
 sequential stream of bytes. When you access a file, you start by opening
 it by name. The operating system then gives you a number, called a file
 descriptor, which you use to refer to the file until you are through with
 it. You can then read and write to the file using its file descriptor.
 When you are done reading and writing, you then close the file, which
 then makes the file descriptor useless.
