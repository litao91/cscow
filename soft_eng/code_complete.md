Design in Construction 
========================
Design Challenges
-----------------
* Wicked Problem: Solve it once to in order to clearly define it and solve
  it again to create a solution that works
* Sloppy Process: when is good enough?
* Trade-Offs and Priorities: weigh competing design characteristics and
  strike a balance among those characteristics.
* Design involves Restrictions (on resources) 

Key Design Concepts
====================
### Managing Complexity
Software development is made difficult because of two different classes of
problems:
* Essential: essential properties are the properties that a thing must
  have to be that thing
* Accidental: properties a thing just happens to have, they don't really
  bear on whether the thing is really that kind of thing. Coincidental,
  discretionary, optional and happenstance.

__Accidental Difficulties__ related to clumsy language syntaxes were
largely eliminated in the evolution from assembly language to third 
generation.

Progress on __Essential Difficulties__ is bound to be slower. At its
essence, software development consists of working out all the details of a
highly intricate, interlocking set of concepts. 
* Difficult to determine precisely how the real world works.

### Importance of Managing Complexity
* No one's skull is big enough to contain a modern computer program
* __The goal__: minimize the amount of program you have to think about at any
  one time
    - Dividing the system into subsystems
    - Goal of all software design: break a complicated problem into simple
      pieces.
    - The more *independent* the subsystems are, the more you can make it
      safe.
* Modern software is inherently complex, and no matter how hard you try,
  you'll eventually bump into some level of complexity that's inherent in
  the real-world problem itself.
    - Minimize the complexity at any one time
    - Keep accidental complexity from needlessly proliferating.

### Desirable Characteristics of a Desgin

* __Minimal complexity__
* __Ease of Maintenance__
* __Minimal connectedness__: hold connections among different parts of program
  to a minimum.
    - Strong cohesion
    - Loose coupling
    - Information hiding
* __Extensibility__
    - Enhance without causing violence to the underlying structure.
* Reusability
* High fan-in: Have a high number of classes that use a given class.
  Implies that your system has been designed to make good use of utility
  classes at the lower levels in the system
* __Low-to-medium fan-out__: having a given class use a low-to-medium number
  of other classes. (less than 7)
* __Portability__
* __Leanness__: A system that has no extra parts. __Finished not when no more can
  be added but when nothing more can be taken away.__
* __Stratification__: keep the levels of decomposition stratified so that you
  can view the system at any single level and get a consistent view. 
    - If you are writing a modern system that has to use a lot of older
      poorly designed code, write a layer of the new system that's
      responsible for interfacing with the old code.
    - Design the layer so that hides the poor quality of the old code.
    - Present a consistent set of Services to the newer layers.
    - Compartmentalizes the messiness of the bad code
    - Jettison the old code don't need to modify the new code except the
      interface layer.
* __Standard techniques__: the more a system relies on exotic pieces, the more
  intimidating it will for someone try to understand it first time.
### Levels of Design
* __Software system__: The entire system
* __Division into Sybsystems or Packages__
    - All major subsystems
    - How to partition the program into major subsystems
    - How each subsystem is allowed to use each other subsystems
    - Particular importance: how various subsystems can communicate. If
      all subsystems can communicate with all other subsystems, you lose
      the benefit of separating them at all.
    - A system-level diagram should be an acyclic graph. A program
      shouldn't contain any circular relationships in which Class A uses
      class B uses class C, and class C uses Class A

    Common subsystems:
    - Business Logic
    - User Interface
    - Database access
    - System dependencies
* Division into classes
* Division into routines
* Internal routine design: laying out the detailed functionality of the
  individual routines.

### Abstraction v.s. Encapsulate

Abstraction: "You're allowed to look at an object at a high level of
detail

Encapsulation: you aren't allow to look at an object at any other level of
detail



