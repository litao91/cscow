# Lucene Analyzer Sources
Note that in the `Analyzer.tokenStream(String, Reader)`:

```java
public final TokenStream tokenStream(final String fieldName,
                                     final Reader reader) throws IOException {
  TokenStreamComponents components = reuseStrategy.getReusableComponents(this, fieldName);
  final Reader r = initReader(fieldName, reader);
  if (components == null) {
    components = createComponents(fieldName, r);
    reuseStrategy.setReusableComponents(this, fieldName, components);
  } else {
    components.setReader(r);
  }
  return components.getTokenStream();
}
```

It use `createComponents(String, Reader)` to obtain a `createComponents`.
It return the sink of the components and stores the components internally.
Subsequent calls to this method will reuse the previously stored
components after resetting them through `TokenStreamCoponents.setReader)`

In `StandardAnalyzer`, the `createComponents`:

```java
@Override
protected TokenStreamComponents createComponents(final String fieldName, final Reader reader) {
  final StandardTokenizer src = new StandardTokenizer(matchVersion, reader);
  src.setMaxTokenLength(maxTokenLength);
  TokenStream tok = new StandardFilter(matchVersion, src);
  tok = new LowerCaseFilter(matchVersion, tok);
  tok = new StopFilter(matchVersion, tok, stopwords);
  return new TokenStreamComponents(src, tok) {
    @Override
    protected void setReader(final Reader reader) throws IOException {
      src.setMaxTokenLength(StandardAnalyzer.this.maxTokenLength);
      super.setReader(reader);
    }
  };
}
```

The `Analyzer.setReader(Reader)`:

```java
protected void setReader(final Reader reader) throws IOException {
  source.setReader(reader);
}
```

Resets the encapsulated components with the given reader.

---

Note: After calling this method, the consumer must follow the work flow
described in `TokenStream` to properly consume its content.

The `getTokenStream` simply:

```java
public TokenStream getTokenStream() {
  return sink;
}
```

---

The `StandardTokenizer.incrementToken()`

```java
@Override
public final boolean incrementToken() throws IOException {
  clearAttributes();
  skippedPositions = 0;

  while(true) {
    int tokenType = scanner.getNextToken();

    if (tokenType == StandardTokenizerInterface.YYEOF) {
      return false;
    }

    if (scanner.yylength() <= maxTokenLength) {
      posIncrAtt.setPositionIncrement(skippedPositions+1);
      scanner.getText(termAtt);
      final int start = scanner.yychar();
      offsetAtt.setOffset(correctOffset(start), correctOffset(start+termAtt.length()));
      if (tokenType == StandardTokenizer.ACRONYM_DEP) {
        typeAtt.setType(StandardTokenizer.TOKEN_TYPES[StandardTokenizer.HOST]);
        termAtt.setLength(termAtt.length() - 1); // remove extra '.'
      } else {
        typeAtt.setType(StandardTokenizer.TOKEN_TYPES[tokenType]);
      }
      return true;
    } else
      // When we skip a too-long term, we still increment the
      // position increment
      skippedPositions++;
  }
}
```

It basically use the parser to analyze the token, and increment until a
valid token is met.

The `TokenStream` API in Lucene is based on decorator pattern.

The `TokenStream` is a subclass of `AttributeSource`, it contains a list
of different `AttributeImpl`s, and methods to add and get them. 

There can only be a single instance of an attribute.

```java
public final <T extends Attribute> T addAttribute(Class<T> attClass) {
  AttributeImpl attImpl = attributes.get(attClass);
  if (attImpl == null) {
    if (!(attClass.isInterface() && Attribute.class.isAssignableFrom(attClass))) {
      throw new IllegalArgumentException(
        "addAttribute() only accepts an interface that extends Attribute, but " +
        attClass.getName() + " does not fulfil this contract."
      );
    }
    addAttributeImpl(attImpl = this.factory.createAttributeInstance(attClass));
  }
  return attClass.cast(attImpl);
}
```
It returns a instance of subclass of `Attribute` 

The constructor of `AttributeSource`:


```java
public AttributeSource(AttributeSource input) {
  if (input == null) {
    throw new IllegalArgumentException("input AttributeSource must not be null");
  }
  this.attributes = input.attributes;
  this.attributeImpls = input.attributeImpls;
  this.currentState = input.currentState;
  this.factory = input.factory;
}
```

It use the **same** attributes as the supplied one.

So the `addAttribute` will return the attribute of the input if it exists.
(?)

The basic logic:

1. Call `tokenStream()` of the `Analzyer` to get the `TokenStream()`
* `tokenStream()` in term calls `createComponents()`, and return the sink
  of the `TokenComponents` by calling `getTokenStream()` of it.
* `createComponents()` create the decoration chain of the `TokenStream()`

