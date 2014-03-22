# Protocols and Datatypes
Protocols and datatypes provide a mechanism for abstraction and concretion
that removes the need to write Java interfaces.

First we will implement our own version of Clojure's buit-in `spit` and
`slurp` functions. 

Then we will take a short detour to build a `CryptoVault`

## Programming to Abstractions
* `slurp` take an input source and returns it as a string
* `spit` takes an output destination and a value, converts the value to a
  string and writes it to the output destination.

Our version of `spit` and `slurp` called `expectorate` and `gulp`, that
work with several existing datatypes.

### gulp and expectorate
Basic version of `gulp` that can read from `java.io.File` only:

```clojure
(ns exmaple.gult
  (:import (java.io FileInputStream InputStreamReader BufferedReader)))
(defn gulp [src]
  (let [sb (StringBuilder.)]
    ;reader = new BufferedReader(new InputStreamReader(new
    ;         FileInputStream(src)))
    (with-open [reader (-> src
                           FileInputStream.
                           InputStreamReader.
                           BufferedReader.)]
      (loop [c (.read reader)]
        (if (neg? c)
          (str sb)
          (do
            (.append sb (char c))
            (recur (.read reader))))))))
```
It creates a `BufferedReader` from a given `File` object and then `loops`
over it, reading a character at a time and appending each to a
`SringBuilder` until it reaches the end of input.

Expectorate:

```clojure
(ns examples.expectorate
  (:import (java.io FileOtputStream OutputStreamWriter BufferedWriter)))

(defn expectorate [dst content]
  (with-open [writer (-> dst
                         FileOutputStream.
                         OutputStreamWriter.
                         BufferedWriter.)]
    (.write writer (str content))))
```

Now we need to update `gulp` and `expectorate` to be able to make
`BufferedReaders` and `BufferedWriters` from datatypes other than files.
So:

```clojure
(defn make-reader [src]
  (-> src FileInputStream. InputStreamReader. BufferedReader.))
(defn make-writer [dst]
  (-> dst FileOutputStream. OutputStreamWriter. BufferWriter.))

(defn gulp [src]
  (let [sb (StringBuilder.)]
    (with-open [reader (make-reader src)]
      (loop [c (.read reader)]
        (if (neg? c)
          (str sb)
          (do
            (.append sb (char c))
            (recur (.read reader))))))))
(defn expectorate [dst content]
  (with-open [writer (make-writer dst)]
    (.write writer (str content))))
```

You can now add support for additional source and destination types to
`gulp` and `exectorate`.

```clojure
(defn make-reader [src]
  (-> (condp = (type src)
          java.io.InputStream src
          java.lang.String (FileInputStream. src)
          java.io.File (FileInputStream .src)
          java.net.Socket (.getInputStream src)
          java.net.URL (if (= "file" (.getProtocol src))
                         (-> src .getPath FileInputStream.)
                         (.openStream src)))
      InputStreamReader.
      BufferedReader.))
```

This is basically creating different type of reader based on the type of
input.

## Interfaces
We can create Java interface in Clojure with `definterface` macro.

```clojure
(definterface name & sigs)
```

Example:
```clojure
(definterface IOFactory
  (^java.io.BufferReader make-rader [this])
  (^java.io.BufferedWriter make-writer [this]))
```

The signature follows the syntax:

    ^return-type function-name [params]

This will create an interface called `IOFactory` that includes two abstract
functions, make-readerand make-writer. Any class that implements this
interface must include `make-readerand` `make-writer` functions that take
a single parameter and an instance of the datatype itself and that return
a `BufferedReader` and `BufferedWriter`, respectively.

## Protocols
Protocols provide a flexible mechanism for abstraction that leverages the
best parts of interfaces by providing only specification, not
implementation, and by letting datatypes implement multiple protocols. 

```clojure
(defprotocol name & opts+sigs)
```


Example Redefine `IOFactory` as a protocol:
```clojure
(defprotocol IOFactory
  "A protocol for things that can be read from and written to."
  (make-reader [this] "Create a BufferedReader.")
  (make-writer [this] "Create a BufferedWriter."))
```

We use the `extend` function to associate an existing type to a protocol
and to provide the required function implementation, usually referred to
as *methods* in this context.

The parameter to extend:

* Name of type to extend
* Name of protocol to implement
* Map of method implementations, where the keys are keywordized versions
  of method names

```clojure
(extend type & proto+mmaps)
```


Basically extend protocols to a new type with name `name`.

Or a full version:
```clojure
(extend AType
  AProtocol
   {:foo an-existing-fn
    :bar (fn [a b] ...)
    :baz (fn ([a]...) ([a b] ...)...)}
  BProtocol
    {...}
...)
```

* Will extend the polymorphism of the protocol's methods to call the
  supplied function **when an `AType` is provided as the first argument**
* Function maps are maps of the keywordized method names to ordinary fns.
* You can implement a protocol on an interface.

Example:
```clojure
(extend InputStream
  IOFactory
  {:make-reader (fn [src]
                  (-> src InputStreamReader. BufferedReader.))
   :make-writer (fn [dst]
                  (throw (IllegalArgumentException. 
                  "Can't open as an InputStream")))})
```

So when we called the `IOFactory`'s functions with `InputStream` as the
first argument, this version of methods will be called.

`extend-type` macro provides a slightly cleaner syntax than `extend`

```clojure
(extend-type type & specs)
```

Example:

```clojure
(extend-type File
   IOFactory
   (make-reader [src]
     (make-reader (FileInputStream .src)))
   (make-writer [dst]
     (make-writer (FileOutputStream. dst)))
```

We can extend the remaining types all at once with the `extend-protocol`
macro

```clojure
(extend-protocol protocol & specs)
```

```clojure
(extend-protocol IOFactory
  Socket
  (make-reader [src]
    (make-reader (.getInputStreamsrc)))
  (make-writer [dst]
    (make-writer (.getOutputStreamdst)))
  URL
  (make-reader[src]
    (make-reader
      (if (= "file" (.getProtocol src))
        (-> src.getPath FileInputStream.)
        (.openStream src))))
  (make-writer [dst]
    (make-writer
       (if (= "file" (.getProtocol dst))
        (-> dst .getPath FileInputStream.)
        (throw (IllegalArgumentException.
                "Can'twritetonon-fileURL"))))))
```


Put all together:
```clojure
(ns examples.io
  (:import (java.io File FileInputStream FileOutputStream
                    InputStream InputStreamReader
                    OutputStream OutputStreamReader
                    BufferedReader BufferedWriter)
           (java.net Socket URL)))
(defprotocol IOFactory
  "A protocol for things that can be read from and written to"
  (make-reader [this] "Creates a BufferedReader.")
  (make-writer [this] "Creates a BufferedWriter."))

(def gulp [src]
  (let [sb (StreamBuilder .)]
    (with-open [reader (make-reader src)]
      (loop [c (.read reader)]
        (if (neg? c)
          (str sb)
          (do
            (.append sb (char c))
            (recur (.read reader))))))))

(defn expectorate [dst content]
  (with-open [writer (make-writer dst)]
    (.write writer (str content))))

(extend-protocol IOFactory
  InputStream
  (make-reader [src]
    (-> src InputStreamReader. BufferedReader.))
  (make-writer [dst]
    (throw
      (IllegalArgumentException.
        "Can't open as an InputStream.")))
  
  OutputStream
  (make-reader [src]
    (throw
      (IllegalArgumentException.
        "Can't open as an OutputStream.")))
  (make-writer [dst]
    (-> dst OutputStreamWriter. BufferedWriter.)) 

  File
  (make-reader [src]
    (make-reader (FileInputStream .src)))
  (make-writer [dst]
    (make-writer (FileOutputStream .dst)))
```
## Datatypes
Use `deftype` macro to define a new datatype.
```clojure
(deftype name (& fields) & opts+specs)
```

Example:
```clojure
(deftype CryptoVault [filename keystore password])
```
Usage:
```clojure
(def vault (->CryptoVault "vault-file" "keystore" "toomaysecrets"))
```

And the fields can be accessed:
```clojure
(.filename vault) ; -> "vault-file
(.keyword vault) ; -> "keystore"
```

Datatypes can implement only those methods that have been specified in
either a protocol or an interface, so let's first create a `Vault`
protocol:

```clojure
(defprotocol Vault
  (init-vault [vault])
  (vault-output-stream [vault])
  (vault-input-stream [vault]))
```
The protocol includes three functions `init-vault`, `vault-output-stream`
and `vault-input-stream` that every vault must implement.

Then we can define type:
```clojure
(deftype CryptoVault [filename keystore password]
  Vault
  (init-vault [vault]
    (println "define method body here"))
  (vault-output-stream [vault]
    (println "define method body here"))
  (vault-input-stream [vault]
    (println "define method body here"))

  IOFactory
  (make-reader [vault]
    (make-reader (vault-input-stream vault)))
  (make-writer [vault]
    (make-writer (vault-output-stream vault))))
```
Notice that the method for more than one protocol can be defined inline.
We have defined the methods for the `Vault` and `IOFactory` protocols
together.

Then 
```clojure
(def vault (->CryptoVault "vault-file" "keystore" "toomaysecrets"))
(init-vault vault)
(expectorate vault "this is a test of CryptoVault")
(gulp vault)
```

A simpler example:
```clojure
(defprotocol P
  (foo [this])
  (bar-me [this] [this y]))
```
This says that we have two method for protocol `P`, one is `foo` accept
itself as parameter and `bar-me`. Two versions of `bar-me` one accept a
`P`  only, one accept `P` and `y`.

```clojure
(deftype Foo [a b c]
  P
  (foo [this] a)
  (bar-me [this] b)
  (bar-me [this y] (+ c y)))
```
Usage:
```clojure
(bar-me (Foo. 1 2 3) 42); => 45
(foo (Foo. 1 2 3)) ; => 1
(foo (Foo. 1 2 3)) ; => 2
```
## Records
A `record` is a datatype, like those created with `deftype`, taht alsow
implements `PersistentMap` and therefore can be used like any other map;
and since record is also a proper classes, they support type-based
polymorphism through protocols.

Create a new reocord with:
```clojure
(defrecord name [& fields] & opts+specs)
```

Example:
```clojure
(defrecord Note [pitch octave duration])

(->Note :D# 4 1/2) ;=> #user.Note{:pitch :D#, :octave 4, :duration 1/2}
(.pitch (->Note :D# 4 1/2)) ;=> :D#


(defprotocol MidNote
  (to-mesc [this tempo])
  (key-number [this])
  (play [this tempo midi-channel]))

(extend-type Note
  MidiNote
  (to-msec [this tempo]
    (println "implementation")))
```

Full example:
```clojure
(ns exmaples.datatypes.midi
  (:import [javax.sound.midi MidiSystem]))
(defprotocol MidiNote
  (to-msec [this tempo])
  (key-number [this])
  (play [this tempo midi-channel]))

(defn perform [notes & {:keys [tempo] :or {tempo 88}}]
  (with-open [synth (doto (MidiSystem/getSynthesizer) .open)]
  (let [channel (aget (.getChannels synth) 0)]
    (doseq [note notes]
      (play note tempo channel)))))

(defrecord Note [pitch octave duration]
  MidiNote
  (to-msec [this tempo]
    (let [duration-to-bpm {1 240, 1/2 120, 1/4 60, 1/8 30, 1/16 15}]
      (* 1000 (/ (duration-to-bpm (:duation this))
              tempo))))
  (key-number [this]
    (println "implemented key-number"))
  (play [this tempo midi-channel]
   (println "implemented play")))
```
`defrecord` by extending a `protocol` meaning that the function defined in
`protocol` can be applied to this `record`(or type).
## reify
The `reify` macro lets you create an **anonymous** instance of a datatype:

```clojure
(reify & opts+specs)
```

Takes name of one or more protocols, or interfaces, and a series of
method body
