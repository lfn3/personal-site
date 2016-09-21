+++
date = "2016-09-19T21:57:44+12:00"
draft = false
title = "Types vs Contracts"

+++

<section>
    <h1>Contracts > Types</h2>
    <h3>Proof with clojure.spec</h3>

    <aside class="notes">
        Ok. So tonight I'm talking to about types, type systems,
        why they aren't enough, and why should dump them for something else.
    </aside>
</section>
<section>
    <h3>Disclaimers</h3>
    <p>Big fan of Clojure</p>
    <p>Intentionally picked a fairly inflammatory topic</p>

    <aside class="notes">
    First of all, a couple of warnings.

    I'm a really big fan of Clojure, so this talks gonna be loaded with bias.

    I did pick a fairly divisive topic. You can tell why I'm wrong at the end.
    </aside>
</section>
<section>
    <h3>What kind of type system?</h3>
    <p>Claims to be sound</p>
    <p>Static</p>

    <aside class="notes">
    I'd think I'm an good engineer, so of course,
    the first thing I'm gonna do is try and reduce scope.

    Not going to be contrasting. Just poking holes.

    I'm going to talk about the properties that static type systems
    try to guarantee, and how those really aren't enough.
    </aside>
</section>
<section>
    <h3>Why use types?</h3>
    <aside class="notes">
        Why would you pick a lanugage with a type system in the first place.
        I think there's a couple of reasons.
    </aside>
</section>
<section>
    <h3>Performance?</h3>
    <p>Nope, C is arguably the most performant language</p>
    <p>It has types - so it can do memory layout</p>
    <p>Will let you gleefully ignore them</p>
    <aside class="notes">
        The first is performance.
        I'm going to write that off for this discussion.
        Since I think the thing the functional programming community
        is more interested in is...
    </aside>
</section>
<section>
    <h3>Correctness</h3>
    <p>We're functional programmers</p>
    <p>Rather be right later than wrong now</p>
    <aside class="notes">
        Everyone here is probably interested in languages
        that have significant overhead compared to more mainstream ones.

        But we want to use them because we're fairly convinced that they
        will make us produce better, meaning less bug prone software, more
        quickly.
    </aside>
</section>
<section>
    <p>Let me paint you a word picture</p>

    <aside class="notes">
    I'm gonna conjure up a situation.

    This is your passion project. The thing you go home and work
    on when you've been fire-fighting production outages for the
    last 48 hours.

    Ok that's a lie, cause you're all thinking about beer now, right?

    But imagine you're the kind of person that goes home to code after
    debugging all day.
    </aside>
</section>
<section>
    <img src="/img/slides/types-vs-contracts/renaissance.jpg"/>

    <aside class="notes">
    This is your program. The thing you've been quietly honing for the last year.
    It's a masterpiece, everyone who reads it is amazed that you produced something
    this elegant.
    </aside>
</section>
<section>
    <img src="/img/slides/types-vs-contracts/program-on-types.png"/>

    <aside class="notes">
    And this is your program on types.
    Anyone think you deserve a high five for this?

    Of course no one actually sees this.
    The jigsaw pieces are what your compiler deals with.
    They're your types
    </aside>
</section>
<section>
    <p>Types are a model of your program</p>
    <p>They describe how a program fits together</p>
    <p>And let a computer validate that</p>

    <aside class="notes">
    This is because types aren't your program.
    This is necessary, right? 

    We wouldn't want to try verifying your program whole cloth, 
    there's plenty of theorems showing that's a pointless excerise

    So lets take away the program for a minute, and just consider the model.
    </aside>
</section>
<section>
    <img src="/img/slides/types-vs-contracts/types.png"/>

    <aside class="notes">
    How much does that tell you about the program?
    I'd argue not a lot. We've stripped away all the texture, all the colour,
    A lot of what makes your program actually function.

    But this is what your compiler has to work with.
    It will be able to tell you the pieces fit together, but not that what's assembled looks correct.
    </aside>
</section>
<section>
    <img src="/img/slides/types-vs-contracts/duck-tweet.png">

    <aside class="notes">
    The properties that static type systems verify aren't that interesting.

    At most we'll know if it has the right shape, and 
    sure, some type systems allow you to make the range of
    shapes so limited that you can be pretty sure you're doing the 'right thing'.

    But they make no guarentees about what happens when you try to do something
    with your duck shaped data.
    </aside>
</section>
<section>
    <p>Not to say they aren't useful</p>
    <p>Just that they aren't enough</p>

    <aside class="notes">
        The predictions type systems make are imperfect, but still useful.
        We can use the information they provide us.
        But we can't rely on them for everything.
    </aside>
</section>
<section>
    <h3>Other properties</h3>
    <ul>
        <li>Halting</li>
        <li>Resource usage</li>
        <li>Safe under concurrency</li>
    </ul>
    <aside class="notes">
        And of we're course leaving aside many other properties we might care about,
        that we know cannot be verified either statically or at runtime without
        real (or close enough to real) data.
    </aside>
</section>
<section>
    <h3>How do we gain confidence?</h3>
    <ul>
        <li>Static analysis</li>
        <li>Model checkers</li>
        <li>Linters</li>
        <li>Tests</li>
    <ul>
    <aside class="notes">
        Do we have other options? Yes, but as before, many of these are 
        inexact.

        Which is not to say they're not effective. Simple methods can
        catch many errors.

        What's missing from this list?
    </aside>
</section>
<section>
    <img src="/img/slides/types-vs-contracts/contract.jpg"/>

    <aside class="notes">
    This isn't a new idea. It's been around since the 80s.
    The version I'm going to talk about, as implemented in
    Clojure, is a bit more recent - it's still in an alpha at the moment.

    That said, let's look at some code:
    </aside>
</section>
<section>
    <pre><code class="clojure">int?</code></pre>
    <aside class="notes">
        This is one of the simplest possible specs.
        Anyone guess what it's asserting?

        So next thing, how do we use something like that?
    </aside>
</section>
<section>
    <pre><code>(require '[clojure.spec :as s])

(s/valid? int? 1)
;; => true

(s/valid? int? "1")
;; => false</code></pre>
    <aside class="notes">
        Hopefully this is relatively clear.
        We're pulling in the spec namespace, and using it to validate some data.

        Ok, so the first difference between a type system and a contract system 
        should be obvious at this point.

        Contracts are executable. We can ask questions about the 
        data we're putting into them, and use the results of that 
        programatically.

        Ok. Next question. Can anyone tell me what int? is?

        It's a function. That's it. Just a function, that returns true or false.
        Which means we can do this:
    </aside>
</section>
<section>
    <pre><code>(defn is-a-spanner? [x]
  (= x "spanner"))

(s/valid? is-a-spanner? "spanner") 
;; => true

(s/valid? is-a-spanner? "wrench") 
;; => false</code></pre>
    <aside class="notes">
        Here we're using defn to define a function, and
        that function checks we're getting a spanner and
        not a wrench.

        Why is this interesting?

        Our specs and our programming language are the same.
        We get the full power and expressivity of the programming language,
        rather than the pale imatation that a type system provides.

        There's another other key selling point to spec, but we'll have to
        do a bit of work to see it.
    </aside>
</section>
<section>
    <pre><code class="clojure">(s/def ::int int?) 
;; => :user/int

(s/valid? ::int 1) 
;; => true</code></pre>
    <aside class="notes">
        So here what we're doing is mapping a couple of keywords to some functions.

        These get put into a global registry which we can then use here.

        And why exactly would you want to do that?
    </aside>
</section>
<section>
    <pre><code class="clojure">(s/explain-data ::int "test")
;; =>
;; {:problems [{:path [], ;;Where
;;              :pred int?, ;;Why
;;              :val  "test", ;;What
;;              :via  [::int], 
;;              :in   []}]}</code></pre>
 <aside class="notes">
    So we can use stuff like this.

    Most of the information here is useful when you're dealing with nested data,
    rather than with just simple scalar values.

    But hopefully you're starting to see one of the key parts of this systems
    design.
    Everything is data.
 </aside>
</section>
<section>
    <h3>Everything?</h3>
    <p>Spec definitions</p>
    <p>Registry</p>
    <p>Results</p>
    <aside class="notes">
        Of course Clojure is kind of cheating here,
        since our code is data.

        What does this let you actually do?
        Well we could go full circle and write a type checker.
        Except someone else already did that.
    </aside>
</section>
<section>
    <img src="/img/slides/types-vs-contracts/type-checker.png"/>
    <aside class="notes">
        Of course given what I said earlier I probably shouldn't be
        advocating this. What else can we do?
    </aside>
</section>
<section>
    <pre><code class="clojure">(defn foo [x]
  (inc x))

(s/fdef foo 
        {:args (s/cat :x int?)
         :ret int?
         :fn #(= (+ (-> % :args :x) 
                    1)
                 (:ret %))})</code></pre>
     <aside class="notes">
         I'll go through this one slowly, since there's a bit going on here.

         Here we're defining a simple function, which will just add one to whatever we put in it.

         Down here, we're slapping a spec around our function.
         In args we're checking x is an int, the cat wrapping it basically consumes the entire seq
         of arguments by name.

         Ret is checking the result is an int.

         In the final :fn bit defines an anonymous function that's 
         used to validate the results relative to the arguments.

         Can't use this like a plain spec from above.                     
     </aside>
</section>
<section>
    <pre><code class="clojure">(require '[clojure.spec.test :as st])

(st/check 'user/foo)
;; => ... {:result true, 
;;         :num-tests 1000, 
;;         :seed 1473583960073}</code></pre>
<aside class="notes">
    Requiring test ns, using it.

    Anyone recognize this style of output? 

    It's from Clojure's quickcheck port, test.check.
</aside>
</section>
<section>
    <pre><code class="clojure">(st/instrument)
;; => [user/foo]

(foo "spanner")
;; => Call to #'user/foo did
;; not conform to spec...</code></pre>

<aside class="notes">
    Useful for catching programmer error at development time,
    or catching inconistencies.
</aside>
</section>
<section>
<p>Looks a lot like a type system?</p>

<aside class="notes">
    Yeah. But, in my opinion, it's quite a bit simpler.

    Get to use the same language.

    Can be used (more easily) programmatically

    Extensible
</aside>
</section>
<section>
    <h3>Conclusion</h3>
    <p>Static systems aren't sufficent</p>
    <p>There are other options</p>
    <p>Contracts are actually pretty good</p>
</section>
