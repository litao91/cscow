# Interrupt
The function the kernel runs in response to a specific interrupt is called
an *interrupt handler* or *interrupt service routine*. The interrupt
handler for a device is part of the device's *driver*.

## Registering an Interrupt Handler
Interrupt handlers are the responsibility of the driver managing the
hardware. 

Each device has one associated driver and, if that device uses iterrupts,
then that driver muster register one interrupt handler.

Drivers can register an interrupt handler and enable a given interrupt
line for handling with the function `request_irq()`, declared in
`<linux/interrupt.h>`:
```c
/* allocate a given interrupt line */
int request_irq(unsigned int irq,
                irq_handler_t handler,
                unsigned long flags,
                cont char* name,
                void* dev)
```

* the first parameter `irq` specifies the interrupt number to allocate.
* `handler` is a function pointer to the actual interrupt handler that
  services this interrupt.

Note, the prototype of handler is defined as follow:
```c
typedef irqreturn_t (*irq_handler_t)(int, void *);
```

