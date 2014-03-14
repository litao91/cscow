# Decorator Pattern
The intent is to add additional responsibilities **dynamically** to an
object. 

Extending an object(s) can be done at **compile time** (statically) by using
inheritance. However, it might be necessary to extend an object
**dynamically** (at run time). (Avoiding tons of subclasses and super
classes comes from different inheritance combination)

Typical example of a graphical window.

* To extend it by adding a frame to it would require extending the window
  to create a `FrameWindow` class
* A `DecoratedWindow` may also be created.
* What about a `FramedDecoratedWindow` ?

Participants classes:

* **Component** -- Interface for object can have responsibilities added to
  them dynamically. 
* **ConcreteComponent** -- Defines an object to which additional
  responsibilities can be added
* **Decorator** -- Maintains a reference to a Component instance, and
  defines an **interface conforms to Component's interface** 
* **Concrete Decorator** -- Concrete Decorator extend the functionality of
  the component by adding state or adding behavior

## Example: Window

```java
package decorator;

/**
 * Window Interface 
 * 
 * Component window
 */
public interface Window {
    public void renderWindow();
}
```

```java
package decorator;

/**
 * Window implementation 
 * 
 * Concrete implementation
 */
public class SimpleWindow implements Window {

    @Override
    public void renderWindow() {
        // implementation of rendering details

    }
}
```

```java
package decorator;

/**
 *
 */
public class DecoratedWindow implements Window{

    /**
     * private reference to the window being decorated 
     */
    private Window privateWindowRefernce = null;

    public DecoratedWindow( Window windowRefernce) {

        this.privateWindowRefernce = windowRefernce;
    }

    @Override
    public void renderWindow() {

        privateWindowRefernce.renderWindow();

    }
}

```

```java
package decorator;

/**
 * Concrete Decorator with extended state 
 * 
 *  Scrollable window creates a window that is scrollable
 * 
 *
 */
public class ScrollableWindow extends DecoratedWindow{
    /**
     * Additional State 
     */
    private Object scrollBarObjectRepresentation = null;

    public ScrollableWindow(Window windowRefernce) {

        super(windowRefernce);
    }

    @Override
    public void renderWindow() {

        // render scroll bar 
        renderScrollBarObject();

        // render decorated window
        super.renderWindow();
    }

    private void renderScrollBarObject() {

        // prepare scroll bar 
        scrollBarObjectRepresentation = new  Object();


        // render scrollbar 

    }
}
```

```java
package decorator;

public class GUIDriver {

    public static void main(String[] args) {
        // create a new window 

        Window window = new ConcreteWindow();

        window.renderWindow();

        // at some point later 
        // maybe text size becomes larger than the window 
        // thus the scrolling behavior must be added 

        // decorate old window 
        window = new ScrollableWindow(window);

        //  now window object 
        // has additional behavior / state 

        window.renderWindow();
    }
}
```
