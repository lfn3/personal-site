+++
date = "2018-02-07T20:16:00+13:00"
draft = true
title = "Unleashing the Undertaker"

+++

So if you've talked to me at any point in the last six months or so I've probably told you I've been working on a 
property testing library for Clojure called [Undertaker](https://github.com/lfn3/undertaker), and it's more 
serious Java cousin, [Undertaker-junit](https://github.com/lfn3/undertaker-junit). Well today's the day, I've finally
released the thing into the wild. So why'd I write it, and what makes it different from the things that already exist?

<!--more-->

So the reason I wrote Undertaker was because the tools I had available for property testing in Java 
[made me angry]({{<ref "property-testing-tooling-in-java.md">}}), and I wanted something better. Also mentioned in that 
post was the fact that I found [Hypothesis](http://hypothesis.works). The little bit of it's API I could use via 
[Hypothesis-java](https://github.com/HypothesisWorks/hypothesis-java) made me want more. Unfortunately it looked it like 
David (the author of hypothesis) hasn't been able to secure the funding to turn it into a fully fleshed out implementation.

I don't think I'd be able to scrape together the money for that, but what I did have available was time and more than a 
little bit of enthusiasm. This is the first time I've actually been able to make that motivation last for a reasonable
amount of time. Much like many other programmers I'm sure, I've got a long debris trail of half finished projects 
clogging up my Github account. I'm not going to say I'm anywhere near done with Undertaker yet, but I'm at the stage 
where I'm willing to let other people have a go at it, which feels like something?

Ok so let's see what's different about it. Here's a test using 
[junit-quickcheck](https://github.com/pholser/junit-quickcheck):

```java
@Property
public void simple(String s1, String s2)
{
    assertEquals(s1.length() + s2.length(), (s1 + s2).length());
}
```

Here's the same thing using [Undertaker-junit](https://github.com/lfn3/undertaker-junit):

```java
@Rule
Source source = new SourceRule();

@Test
public void simple()
{
    String s1 = source.getString();
    String s2 = source.getString();
    assertEquals(s1.length() + s2.length(), (s1 + s2).length());
}
```

Not really that different, right? If anything, a bit longer. The nice part about it is we don't have to specify all the
input up front, which removes the need to write a lot of generators, and simplifies the ones we do write. So let's take
take a look at a more complicated example:

```java
@Property
public void matrix(@From(MatrixGenerator.class) Matrix m)
{
    m.failOn42();
}
```

This is taken from my comparison [here](https://github.com/lfn3/java-comparative-quickchecking), but basically the crux
of it is we generate a 2d array and slap it in a class (Matrix). failOn42 does what it says on the can, if the number
42 features in the Matrix, it throws. The interesting part for us is the generator required by junit-quickcheck:

```java
public static class MatrixGenerator extends Generator<Matrix> {
    public MatrixGenerator() {
        super(Matrix.class);
    }

    @Override
    public Matrix generate(SourceOfRandomness sourceOfRandomness, 
                           GenerationStatus generationStatus) {
        int width = sourceOfRandomness.nextInt(0, 1000);
        int height = sourceOfRandomness.nextInt(0, 1000);

        int[][] matrix = new int[width][height];

        for (int i = 0; i < width; i++) {
            for (int j = 0; j < height; j++) {
                matrix[i][j] = sourceOfRandomness.nextInt();
            }
        }

        return new Matrix(matrix);
    }
}
```

There's quite a bit of code there... Let's try it with undertaker.


```java
@Test
public void matrix()
{
   int width = source.getInt(1, 1000);
   int height = source.getInt(1, 1000);
   
   Matrix m = new Matrix(source.getArray(int[].class, s -> 
      s.getIntArray(Source::getInt, height), width));
   
    m.failOn42();
}
```

Java 8's functional bits are a real help here. I'm hopeful this will basically lead to less hoop jumping when it comes
to writing generators, since we're just using "regular" Java features. The Clojure version is similar, relying on 
plain old functions rather than the Generators and higher order functions of 
[test.check](https://github.com/clojure/test.check). I've got some comparisons and examples 
[here](https://github.com/lfn3/undertaker/blob/master/docs/coming-from-test-check.md).

So right now it works, or at least it seems like it does, and it's got parity with the tools in the Java space as far as
I can tell. At the moment test.check beats it on generating particularly adverse input e.g. test.check will always throw
`Integer.MAX_VALUE` at you for instance. I'm working on that, but the way I want it to work with Undertaker makes sets
hard. The other thing I'm planning on improving in the near future is performance. I think I can make it go a lot faster,
and I'd like to make some pretty graphs out of the benchmarks as well.

I'd also like to thank all the people who've put prior effort into property testing, but particularly 
[David R. MacIver](http://www.drmaciver.com/) who created Hypothesis which directly and heavily influenced Undertaker.
Also the author and maintainer of [test.check](https://github.com/clojure/test.check), 
[Reid Draper](http://reiddraper.com/) and [Gary Fredericks](http://gfredericks.com/) (respectively), since test.check 
got me started on this whole property testing thing, and I totally cloned the API for the clojure version of Undertaker.

So yeah if you've got any questions about Undertaker, or any feedback to offer, or you just wanna have a yarn, please 
get in touch. You can find me on twitter: [@lfln3](https://twitter.com/lfln3), the 
[Clojurians Slack](https://clojurians.slack.com/) as [lfn3](https://clojurians.slack.com/messages/D1KF9A63W) 
(Dunno if that'll link will work, btw.) or email me as `liam@<this-domain>`.