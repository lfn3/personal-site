+++
date = "2017-05-07T11:43:00+12:00"
draft = false
title = "Property testing tooling in Java"
+++

The NZ contingent of LMAX went to [Codemania](http://codemania.io/) at the end
of last week. And it was awesome, I always come out of there excited to make
things. Then usually I give myself a hangover which puts an end to that.
Anyway, the two themes we picked out from the conference were automate more,
and property test all the things.

I'm already a huge fan of [test.check](https://github.com/clojure/test.check)
for my Clojure code, and have been feeling some friction working with the
tooling we had for property testing in Java. So I spent some time digging into
the options we had, and this post is the result of that.

This post assumes you have some knowledge of what property based testing is,
and how it works. I'm just going to compare and contrast Java libraries that
enable it.

<!--more-->

So we already had two libraries in our codebase for doing property testing:
[junit-quickcheck](https://github.com/pholser/junit-quickcheck) and
[quicktheories](https://github.com/ncredinburgh/QuickTheories).
I leaned slightly more towards quicktheories to start with, since it's got a more
functional API that I'm a bit of a sucker for.

Junit, and by extension, junit-quickcheck, doesn't have a very functional api.
But that's actually a good thing when you're writing Java. Coming from a Clojure
background, the functional programming options available in Java feel a little
clunky to be honest. Junit has been around for a while, and has an api that
doesn't really try to hide that. Which is fine! It's easy to read and reason
about in the context of the language it lives in.

The junit-quickcheck library pretty logically follows the path that junit laid
out, using annotations and test methods that take arguments to do it's thing:

```java
@Property
public void simple(String s1, String s2)
{
    assertEquals(s1.length() + s2.length(), (s1 + s2).length());
}
```

The api for "I want to use this particular example" is pretty obvious:

```java
@Test
public void example()
{
    simple("hello", "world!");
}
```

The thing I like most about this library is it's simple and approachable for
people who are at least a little familiar with Java and Junit. Even the way you
write a generator is comparatively simple:

```java
public class MatrixGenerator extends Generator<Matrix> {
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

Yes, it's verbose, but *shrug* it's Java. Go figure.

So that should have given you a vague idea of how junit-quickcheck works, so I'm
going to contrast that with quicktheories. The first example of checking string
length looks like this:

```java
@Test
public void simple() {
    qt().forAll(strings().allPossible().ofLengthBetween(0, 100),
                strings().allPossible().ofLengthBetween(0, 100))
        .checkAssert((s1, s2) ->
          assertEquals(s1.length() + s2.length(), (s1 + s2).length()));
}
```

Clearly, it's a lot more functional, right? The generators are configured using
builders, we can write our function as a lambda... but the test body is 4 times
the size of the junit-quickcheck example, and the actual bit we care about,
`assertEquals...` is a lot more... buried than in the junit-quickcheck example.
This is a problem that gets worse, as you write more complex tests.

Another issue I have with quicktheories is that it doesn't integrate amazingly
well with the rest of Junit. The `@Before` annotation doesn't work as expected,
you have to explicitly call it in the middle of your assertion.

I guess this is the general problem with quicktheories. It's just not Java-y
enough, and that sticks out. The process for producing new generators suffers
terribly from this in my opinion:

```java
Source<Matrix> matrixSource =
  Source.of(
    integers().between(1, 100)
              .combine(
                integers().between(1, 100),
                //Can't size generator based on prior generators?
                lists().arrayListsOf(integers().all())
                       .ofSizeBetween(1, 100),
                (w, h, vals) -> {
                  int[][] arr = new int[w][h];
                  for (int i = 0; i < w; i++) {
                    for (int j = 0; j < h; j++) {
                      arr[i][j] = vals.get((i + j) % vals.size());
                    }
                  }
                  return new Matrix(arr);
                }));
```

Note this doesn't include functionality to allow shrinking. Compare to the
junit-quickcheck generator above. I think the junit-quickcheck generator is
considerably easier to read, and you get shrinking out of the source of
randomness, rather than having to supply it yourself.

There is one problem both these libraries share, in that they require you to
specify all of the input you require to a test up front, either in the args to
a `@Property` annotated method, or in the `qt().forAll()` call. I was hopeful
that the "dark horse" entrant
[hypothesis](https://github.com/HypothesisWorks/hypothesis-java)
would let me write tests that read a little better.

This was not the case. It's not ready for prime time, which the author
openly admits. It's a real shame, since I the programming model looks very
appealing.

So the conclusion I came to was that junit-quickcheck was the best option I
could find at the moment. It integrates the best with Junit, and has a simple,
idiomatic api. Quicktheories could be improved to make it more competitive, for
example by making generators have sane defaults that are more succinct than the
current examples. To a certain extent it's hamstrung by the fact that it is just
harder to use lambdas in Java than in more functional languages.

All the code that I posted here, and used to evaluate these libraries is
available on [GitHub](https://github.com/lfn3/java-comparative-quickchecking).
