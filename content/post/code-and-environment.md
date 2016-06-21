+++
date = "2016-04-13T17:26:00+12:00"
draft = true
title = "Code and Environment"

+++

Based on thoughts from http://www.physicsofsoftware.com/uploads/9/8/5/4/9854624/compressivestrength.pdf

Basically the problem is this - you're writing a program to parse a complicated binary file format. It has headers, and multiple nested data structures. So you write something like:

```
(defn read-field [file-contents offset]
  (case (read-type file-contents offset)
    :integer (read-integer file-contents offset)
    ;and etc
    ))

(defn read-body [file-contents header-len body-len]
  (loop [offset header-len
         results []]
    (when (> body-len offset)
      (let [value (read-field file-contents offset)]
        (recur (+ offset (size-of value))
               (conj results value))))))

(defn read-file [file]
  (let [contents (slurp file)
        header-map (read-headers contents)]
    (read-body contents
               (:headers-length header-map)
               (:body-length header-map))))
```

Then you figure out that an item in the header indicates how to parse one of the low level data structures - i.e. the endian-ness of integers.
Now you either have to punch that parameter through every function call between parsing that data type and parsing the headers, or use a dynamic binding, which might actually probably a quick, and maybe even acceptable solution in this case.

OO languages probably don't have this problem either, since you can just add a 'endianess' parameter to the parser class, presuming you didn't decompose your classes the same way Clojure programmers split up functions. I suspect your answer in that case is something involving a factory function.

Is there a Clojure analogy to that? Yes, we could pick a function to use based on the headers, and pass that through or rebind it, but that in my opinion makes it less obvious what the code parsing an individual field is doing, especially in the case of rebinding, and essentially turns your namespace into a singleton class. That said, the space I want to think about is the binding one - in Clojure we are able to alter the environment we execute in pretty effectively at runtime, but we intentionally limit how much we use this and how far we take it.

In terms of effects on our code, what does binding actually do? My way of thinking about it is that it alters the environment code excutes within. Every function has two environments it can pull information from (either data or functions). It's local environment (whatever exists in the `let` and similar forms around it) and the global environment (potentially anything defined in your codebase or dependencies, but limited by requires and imports, thankfully). Bindings mix these two things together, by establishing a new local environment in which the global environment is supplanted by a new, different one. 

The reason we shy away from bindings is that usually function calls jump into a clean local environment. Bindings flout this rule,


 We (programmers) don't like having multiple, nested environments, especially one's that can change and shift based on the caller. I can't think of a lanaguage that encourages it. Usually we have a global environment where most of our program is defined, and a local one where the innards of individual functions live. At most we might alter the global environment within our tests, but that's very limited in scope, time and depth - you wouldn't have several different rebindings without being accused of doing something wrong.

This begs a question - why don't we like this? It would seem to be a very powerful option to have, dynamically altering how a function percieves it's surroundings. The answer is fairly obvious - it gives us one more thing to worry about. I would argue one of the greatest strengths of functional programming languages like Clojure is that they reduce the mental overhead of dealing with code. You don't have to worry about wide swaths of things (mutation and class decomposition being the biggest ones in my opinion) that you would in more traditional OO languages. Employing dynamic binding trickery lets you ramp that complexity all the way back up again really, really quickly.

That's not to say they don't have a use. Mocking frameworks in other environments are a very pale imitation of the power and ease that rebinding offers a Clojure programmer. I used to frown upon 'mockist' testing approaches before I began using Clojure seriously, due to the amount of effort involved in pulling your program apart and introducing seams largely for testing. This simply isn't necessary in Clojure, since the seams are largely omnipresent if your code is well written - you don't have to account for another factor in your design, or at least not to the extent that you do in C# or Java.

Actually, nested environments exist in JS. Not really sure how much use they get used... as far as I recall they aren't looked on as a particularly well thought out or useful feature.