# 从开机加电到执行`main()`函数之前的过程
## `head.s` 开始执行
在执行`main`函数之前，先要执行三个由汇编代码生成的函数:

* `bootsect`
* `setup`
* `head`

1. 第一步， 加载`bootsect`到`0x07C00`
* 第二步， 加载`setup`到`0x90200`

这两段程序是分别加载，分别执行

`haed`程序与他们不同:

* 先将`head.s`汇编成目标代码(object code)
* 将用C写的内核编译成目标代码(object code)
* 然后链接(link)成system 模块

也就是说, 两者紧挨着, head在前, system在后
