# Proxy Pattern
Sometimes we need the ability to control the access to an object. For
example if we need to use only a few methods of some costly objects we'll
initialize those objects when we need them entirely. Until that point we
can use some light objects exposing the same interface as the heavy
objects. These light objects are called proxies and they will instantiate
those heavy objects when they are really need and by then we'll use some
light objects instead.

## Components
The participants classes are:

* **Subject** -- The interface must be implemented by the proxy as well so
  that the proxy can be used in any location where the RealSubject can be
  used
* **Proxy**
    - Maintains a reference that allows the Proxy to access the
      RealSubject
    - Implement the same interface implemented by the RealSubject
    - Control access to the RealSubject
* **RealSubject** -- the real object that the proxy represents

## Applications
* **Virtual Proxies**: delaying the creation and initialization of
  expensive objects until needed.
* **Remote Proxies**: A local representation for an object that is in a
  different address space.
* **Protection Proxies**: A proxy controls access to RealSubject methods,
  by giving access to some objects while denying access to others.
* **Smart References**: providing a sophisticated access to certain
  objects such as tracking the number of references to an object and
  denying access if a certain number is reached, as well as loading an
  object from database into memory on demand.

## Example

```java
package proxy;

/**
 * Subject Interface
 */
public interface Image {

    public void showImage();

}
```

---

```java
package proxy;

/**
 * Proxy
 */
public class ImageProxy implements Image {

    /**
     * Private Proxy data 
     */
    private String imageFilePath;

    /**
     * Reference to RealSubject
     */
    private Image proxifiedImage;


    public ImageProxy(String imageFilePath) {
        this.imageFilePath= imageFilePath;
    }

    @Override
    public void showImage() {

        // create the Image Object only when the image is required to be shown

        proxifiedImage = new HighResolutionImage(imageFilePath);

        // now call showImage on realSubject
        proxifiedImage.showImage();

    }

}
```

---

```java
package proxy;

/**
 * RealSubject
 */
public class HighResolutionImage implements Image {

    public HighResolutionImage(String imageFilePath) {

        loadImage(imageFilePath);
    }

    private void loadImage(String imageFilePath) {

        // load Image from disk into memory
        // this is heavy and costly operation
    }

    @Override
    public void showImage() {

        // Actual Image rendering logic

    }

}
```

---

```java
package proxy;

/**
 * Image Viewer program
 */
public class ImageViewer {


    public static void main(String[] args) {

    // assuming that the user selects a folder that has 3 images    
    //create the 3 images     
    Image highResolutionImage1 = new ImageProxy("sample/veryHighResPhoto1.jpeg");
    Image highResolutionImage2 = new ImageProxy("sample/veryHighResPhoto2.jpeg");
    Image highResolutionImage3 = new ImageProxy("sample/veryHighResPhoto3.jpeg");

    // assume that the user clicks on Image one item in a list
    // this would cause the program to call showImage() for that image only
    // note that in this case only image one was loaded into memory
    highResolutionImage1.showImage();

    // consider using the high resolution image object directly
    Image highResolutionImageNoProxy1 = new HighResolutionImage("sample/veryHighResPhoto1.jpeg");
    Image highResolutionImageNoProxy2 = new HighResolutionImage("sample/veryHighResPhoto2.jpeg");
    Image highResolutionImageNoProxy3 = new HighResolutionImage("sample/veryHighResPhoto3.jpeg");


    // assume that the user selects image two item from images list
    highResolutionImageNoProxy2.showImage();

    // note that in this case all images have been loaded into memory 
    // and not all have been actually displayed
    // this is a waste of memory resources
    }
}
```
