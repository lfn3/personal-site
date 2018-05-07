+++
date = "2018-05-07T20:01:44+13:00"
draft = false
title = "Property testing made simple"

+++

<section>
<h2>Property testing made simple(r)</h2>
</section>

<section>
    <p>Property testing?</p>
    <p>Aka generative testing</p>
</section>

<section>
  <p>I wrote a property testing library</p>
  <p>Why?</p>
  
  <aside class="notes">
    So I write Java during the day.
    The options for property testing in Java suck.
  </aside>
</section>

<section>
  <img src="/img/slides/property-testing-made-simple/hypothesis-site.png"/>
  <aside class="notes">
      I found this thing called Hypothesis, and thought that was really cool, I want one of those.
  </aside>
</section>

<section>
  <p>What's different about Undertaker?</p>
  <aside class="notes">
    What's different about Undertaker?
  </aside>
</section>

<section>
  <pre><code class="clojure">(undertaker/defprop property
  (let [v (undertaker/vec-of undertaker/int)
        s (sort v)]
    (is (= (count v) (count s)))
    (is (ascending? s))))</code></pre>
</section>

<section>
    <p>Doesn't seem like much?</p>
</section>

<section>
    <ul>
        <li>Easier to convert existing code</li>
        <li>Less test specific setup code</li>
        <li>Can structure tests more linearly</li>
        <li>Better integration with exisiting tooling</li>
        <li>Easier to compose generators</li>
    </ul>
</section>

<section>
    <p>test.check:</p>
    <pre><code>(def bytes-and-idx-gen 
  (gen/bind gen/bytes 
            #(gen/tuple %1 (gen/choose 0 (count %1)))))</code></pre>
    <p>Undertaker:</p>
    <pre><code>(defn bytes-and-idx-gen [] 
  (let [b (undertaker/bytes)]
    [b (undertaker/int 0 (count b))]))</code></pre>
</section>

<section>
    <p>You still have to tell Undertaker what's input:</p>
    <pre><code class="clojure">(with-interval ...)</code></pre>
</section>

<section>
    <p>Don't have to do that up front.</p>
    <p>Can add intervals (to make output show up) when and if you need to debug something</p>
</section>

<section>
    <p>The little things matter</p>
    <p>And lots of little things can add up</p>
</section>

<section>
    <p>How does it work?</p>
    <p>Generate random bytes, map them into a range, convert to target type.</p>
    <p>Some book keeping for shrinking & showing output (intervals)</p> 
</section>

<section>
    <p>Slow when shrinking, and when generating collections</p>
    <p>Should be able to make it much, much faster</p>
</section>

<section>
    <p>Lots of other things to do as well</p>
    <ul>
        <li>Clojurescript/Javascript</li>
        <li>Better stateful testing story</li>
        <li>test.check integration</li>
        <li>Better faliure output</li>
    </ul>
</section>

<section>
     <p>Questions?</p>
</section>

<section>
    <p>Dealt with a couple of problems</p>
    <aside class="notes">
        This has unfortunately just made the other ones more acute.
    </aside>
</section>

<section>
    <p>Still have to figure out the properties we want to (or even are able to) test</p>
    <p>And encode that property in code</p>
    <aside class="notes">
        I guess this is the crux of the problem.
        Turns out that you still have to write the test.
    </aside>
</section>

<section>
    <p>How do we make it easier to write a property test?</p>
    <aside class="notes">
        I'd argue we're better off coming at it from a different angle.
        Put the tests in your production code - as assertions.
    </aside>
</section>

<section>
    <p>Means you get to seperate the input generation and the invariants</p>
    <p>The invariants are more broadly useful (and usable)</p>
</section>

<section>
    <p>Easier to write invariants this way</p>
    <p>Access to all the bits of the system</p>
</section>

<section>
    <p>However, these aren't the properties your users care about</p>
    <p>Errors vs. Bugs</p>
</section>

<section>
  <img src="/img/slides/property-testing-made-simple/why-programs-fail-cover.jpg"/>
</section>

<section>
    <p>Errors are inconsistencies or miscalculations in your code</p>
    <p>Bugs are when those errors propogate far enough to be user visible</p>
</section>

<section>
    <p>Assertions will catch errors</p>
    <p>This is a double edged sword</p>
</section>

<section>
    <p>Conclusion</p>
    <p>Solved some problems</p>
    <p>Need to think more about the other ones</p> 
</section>

<section>
    <p>@lfln3</p>
    <p>liam@lfn3.net</p>
    <img src="/img/slides/property-testing-made-simple/lmax-exchange.svg" 
        style="border:0; background: white;"/>
    <p>We're hiring! (Java tho)</p>
</section>