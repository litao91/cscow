# Mediator Pattern

Define an object that encapsulates how a set of objects interact. Mediator
promots loose coupling by keeping objects from referring to each other
explicitly, and it lets you vary their interaction independently.

## Participants
* **Mediator** -- defines an interface for communicating with Colleague
  objects.
* **ConcreteMediator** -- Knews the colleague classes and keep a refernece
  to colleague objects. 
    - Implements the communication and transfer the messages between the
      colleague classes
* **Colleague classes** -- Keep a reference to its Mediator object
    - Communicates with the Mediator whenever it would have otherwise
      communicated with another Colleague.

## Examples
Dialog classes in GUI applications framework. A Dialog window is a
collection of graphic and non-graphic controls. The Dialog class provides
the mechanism to facilitate the interaction between controls. For example,
when a new value is selected from a ComboBox object a Label has to display
a new value. Both the ComboBox and the Label are not aware of the
existence of the controls.

## Example Code
Mediator:
```java
public abstract class AbstractMediator {
    protected Purchase purchase;
    protected Sale sale;
    protected Stock stock;

    public AbstractMediator() {
        purchase = new Purchase();
        sale = new Sale(this);
        stock = new Stock(this);
    }

    public abstract void execute(String str, Object...objects);
}
```

```java
publilc class Mediator extends AbstractMediator {
    pbulic void execute(String str, Object...objects) {
        if(str.equals("purchase.buy")) {
            this.buyComputer((Integer)objects[0]);
        } else if (str.equals("sale.sell")) {
            this.sellComputer((Integer)objects[0]);
        }else if(str.equals("sale.offsell")) {
            this.offSell();
        }else if(str.equals("stock.clear")) {
            this.celarStock();
        }
    }

    private void buyComputer(int number) {
        int saleStatus = super.sale.getSaleStatus();
        if(saleStatus > 80) {
            System.out.println("Buying");
            super.stock.increase(number);
        } else {
            int buyNumber = number/2;
            System.out.println("Buying");
        }
    }

    private void sellComputer(int number) {
        if(super.stock.getStockNumber() < number) {
            super.purchase.buyIBMcomputer(number);
        }
        super.stock.decrease(number);
    }

    private void offSell() {
        System.out.println("offsell");
    }

    private void clearStock() {
        super.sale.offSale();
        super.purchase.refuseBuyIBM();
    }
}
```

---

```java
public abstract class AbstractColleague {
    protected AbstractMediator mediator;
    public AbstractMediator mediator;
    public AbstractColleague(AbstractMediator _mediator) {
        this.mediator = _mediator;
    }
}
```

The rest omitted.
