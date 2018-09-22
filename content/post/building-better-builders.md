+++
date = "2018-09-18T10:40:00+01:00"
draft = true
title = "Building Better Builders"
tags = ["LMAX"]

+++

So one of the things that's been appearing with greater and greater frequency
in the LMAX code base is test builders. These are objects created in the 
[builder pattern](https://en.wikipedia.org/?title=Builder_pattern) 
that we use in our tests to produce the inputs or parts of the system we're testing. 
That's a bit abstract, so here's an example:

```java
class FooBuilder
{
    private int anInt;
    private long aLong;
    private String aString;
    
    public FooBuilder anInt(final int anInt)
    {
        
    }
    
    public void aLong(final long aLong)
    {
        
    }
    
    private 
    
    public Foo build()
    {
        return new Foo(anInt, aLong, aString);
    }
}
```


- Start with empty builders
- Maybe have a default
- Get them to implement `Generator`
- Customize them in your test: `generate(T).x().y().z().build()`
- Builder interface?