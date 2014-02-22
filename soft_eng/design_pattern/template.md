# Template Method Pattern
Define the skeleton of an algorithm in an operation, deferring some steps
to subclass. Template Method lets subclasses redefine certain steps of an
algorithm without changing the algorithm's structure.

```java
public abstract class HummerModel {
    public abstract void start();
    pubilc abstract void stop();
    public abstract void alarm();
    public abstract void engineBoom();
    public void run() {
        this.start();
        this.engineBoom();
        this.alarm();
        this.stop();
    }
}

public class HammerH1Model extends HammerModel {
     public void alarm() {
         System.out.println("悍马H1鸣笛...");
     }
     public void engineBoom() {
         System.out.println("悍马H1引擎声音是这样在...");
     }
     public void start() {
         System.out.println("悍马H1发动...");
     }
     public void stop() {
         System.out.println("悍马H1停车...");
     }
}
public class HummerH2Model extends HummerModel {
    public void alarm() {
        System.out.println("悍马H2鸣笛...");    
    }
    public void engineBoom() {
        System.out.println("悍马H2引擎声音是这样在...");
    }
    public void start() { 
        System.out.println("悍马H2发动...");
    }
    public void stop() {
        System.out.println("悍马H2停车...");
    }
}
```

Note that the `HammerH1Model` and `HammerH2Model` share the same `run()`.
