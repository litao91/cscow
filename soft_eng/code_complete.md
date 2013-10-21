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

* Minimal complexity
* Ease of Maintenance
* Minimal connectedness: hold connections among different parts of program
  to a minimum.
    - Strong cohesion
    - Loose coupling
    - Information hiding
* Extensibility
    - Enhance without causing violence to the underlying structure.
* Reusability
* High fan-in: Have a high number of classes that use a given class.
  Implies that your system has been designed to make good use of utility
  classes at the lower levels in the system
* Low-to-medium fan-out: having a given class use a low-to-medium number
  of other classes. (less than 7)
* Portability
* Leanness: A system that has no extra parts. __Finished not when no more can
  be added but when nothing more can be taken away.__
* Stratification: keep the levels of decomposition stratified so that you
  can view the system at any single level and get a consistent view. 
    - If you are writing a modern system that has to use a lot of older
      poorly designed code, write a layer of the new system that's
      responsible for interfacing with the old code.
    - Design the layer so that hides the poor quality of the old code.
    - Present a consistent set of Services to the newer layers.
    - Compartmentalizes the messiness of the bad code
    - Jettison the old code don't need to modify the new code except the
      interface layer.
* Standard techniques: the more a system relies on exotic pieces, the more
  intimidating it will for someone try to understand it first time.
    

