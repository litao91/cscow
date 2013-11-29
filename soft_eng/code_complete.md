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
---------------------
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

### Inheritance
* Works synergistically with the notion of abstraction.
* Abstraction deals with objects at *different levels of detail*


Design Building Blocks: Heuristics
---------------------------------
### Information Hiding
Isolate unstable areas so that the effect of change will be limited to one
class, steps:
1. Identify items that seem likely to change. (list of potential changes
   and likelihood of each change.
* Separate items that are likely to change. Compartmentalize each volatile
  component in its own class.
* Isolate items seem likely to change. Design interface.

Few areas that are likely to change:
* Business logic
* Hardware dependencies
* Input and output
* Nonstandard language features
* Difficult design and construction areas.
* Status variables
    - Use an enumerated type instead of boolean
    - Use access routines rather than checking the variable directly.
* Data-size constraints.

A good technique for identifying areas likely to change is 
* first to identify the minimal subset of the program that might be of use
  to the user. The subset makes up the core of the system and is unlikely
  to change. 
* Next, define minimal increments to the system. These areas of potential
  improvement constitute potential changes to the system. Design these
  areas using the principles of information hiding. 

### Keep Coupling Loose
**Coupling**: How tightly a class or routine is related to other classes
or routines.

**Loose Coupling**: Create classes and routines with small, direct,
visible, and flexible relations to other classes and routines.

Good design:
* One module can easily be used by the other modules. 
* Make the connections among modules as simple as possible.
* Create modules that depend little on other modules.

#### Coupling Criteria

* **Size**: number of connections between modules. Small is beautiful.
* **Visibility**: prominence of connection between two modules. Making an
  obvious connection.
* **Flexibility**: How easy you can change connections between modules.

#### Kinds of coupling:
* **Simple-data-parameter coupling**: all the data passed between them are
  of primitive data types and all all the data is passed through parameter
  lists. Normal and acceptable.
* **Simple Object coupling**: A module is simple-object coupled to an
  object if it instantiates that object. Fine.
* **Object parameter coupling**: Object1 requires Object2 to pass it an
  Object3. Tighter than pass primitive data types.
* **Semantic coupling**: One module makes use, not of some syntactic
  element of another module, but of some semantic knowledge of another
  module's inner workings. Insidious.
  - Module1 pass a control flag to Module2 that tells Module 2 what to do
  - Module2 uses global data after the global data has been modified by
    module1.

### Use of design pattern
* **Abstract Factory**: creation of sets of related objects by specifying
  the kind of set but not the kinds of each specific object.
* **Adapter**: Interface conversion. 
* **Bridge**: Builds an interface and an implementation in such a way that
  either can vary without the other varying.
* **Composite**: Consists of an object that contains additional objects of
  its own type so that client code can interact with the top-level object
  and not concern itself with all the detailed objects.
* **Decorator**: Attaches responsibilities to an object dynamically,
  without creating specific subclasses for each possible configuration of
  responsibilities.
* **Facade**: Provides a consistent interface to code that wouldn't
  otherwise offer a consistent interface.
* **Factory Method**: Instantiates classes derived from a specific base
  class without needing to keep track of the individual derived classes
  anywhere but the Factory Method.
* **Iterator**: A server object that provides access to each element in a
  set sequentially.
* **Observer**: Keeps multiple objects in sync with each other by making a
  third object responsible for notifying the set of objects about changes
  to members of the set. 
* **Singleton**: Provides a global access to a class that has one and only
  one instance.
* **Strategy** Defines a set of algorithms or behaviors that are
  dynamically interchangeable with each other. 
* **Template Method**: Defines the structure of an algorithm but leaves
  some of the detailed implementation to subclasses.

Design Practices
-----------------
### Top-Down

* Begins at a high level of abstraction
* Define  base classes or other non-specific design elements
* As you develop the design, you increase the level of detail,
  identifying derived classes, collaboration classes, and other
  detailed desgin elements.


It's iterative in a couple of sense:
* You usually don't stop after one level of decomposition. You keep going
  for several levels. 


### Bottom Up 

* Design starts with specifics and works toward generalities.
* Typically begins by identifying concrete objects and then generalizes
  aggregations 
