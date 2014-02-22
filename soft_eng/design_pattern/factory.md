# Factory Pattern
Define an interface for creating an object, but let subclasses decide
which class to instantiate. Factory Method lets a class defer
instantiation to subclasses.

Code Example:
```java
public interface Human {
    public void getColor(); // skin color
    public void talk(); //human can talk
}

public class BlackHuman implements Human {
    public void getColor() {
        System.out.println("Black");
    }

    public void talk() {
        System.out.println("BlackHuamn talking");
    }
}

public class YellowHuman implements Human {
    public void getColor() {
        System.out.println("Yellow");
    }

    public void talk() {
        System.out.println("YellowHuamn talking");
    }
}

public class WhiteHuman implements Human {
    public void getColor() {
        System.out.println("White");
    }

    public void talk() {
        System.out.println("WhiteHuamn talking");
    }
}

public abstract class AbstractHumanFactory {
    public abstract <T extends Human> T createHuman(Class<T> c);
    }
}

public class HumanFactory extends AbstractHumanFactory {
    public <T extends Human> T createHuman(Class<T> c) {
        Huamn human = null;
        try {
            human = (Human)Class.forName(c.getName()).newInstance();
        } catch(Exception(Exception e) {
        }
        return (T) human
    }
}

public class Main {
    public static void main(String[] args) {
        AbstractHumanFactory factory = new HumanFactory();
        Human whiteHuman = factory.createHuman(WhiteHuman.class);
    }
}
```

