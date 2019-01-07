+++
date = "2019-01-07T20:31:00+00:00"
draft = false
title = "re-frame and the Back Button"
+++

A few things I've been working on over the christmas break have involved a fair bit of front end work.
I've been using [re-frame](https://github.com/Day8/re-frame) to do most of it, 
which has been a very satisfying experience. It's made me quite a bit happier than the month or so I spent working with 
[Vue.js](https://vuejs.org/) for a project at [LMAX](https://www.lmax.com).
But all of that's probably a topic for another post. 

One of the things that I (along with a good chunk of the internet, [apparently](https://www.google.com/search?q=don%27t+break+the+back+button))
loathe is when a web site or app renders the back button non-functional, or otherwise stops it from doing what I expect.
So of course as soon as I added a second panel to my application (I managed to hack away on a single page for a while.)
I had to fix the back button.

<!--more-->

Re-frame's (extensive, witty, and generally awesome) [documentation](https://github.com/Day8/re-frame/tree/master/docs)
already has [a page](https://github.com/Day8/re-frame/blob/master/docs/Navigation.md) on how to handle navigation.
The approach it takes is totally reasonable in terms of the web-app itself, and if you're using re-frame outside of a
web page, it's probably just fine.

It will not, result in the browser knowing a transition has happened, so the url will not change, and the back button
 will drag you back to the last site you were on, rather than undoing the last thing you clicked on (as I would expect
 in this case).
 
Fortunately there's a [widely supported](https://caniuse.com/#feat=history) browser 
[history api](https://developer.mozilla.org/en-US/docs/Web/API/History_API) that'll let us sort this out.

There's three things we need to do:

1. `pushState` when a link is clicked
2. Handle the `popstate` event (triggered when someone hits the forward or back button)
3. Make sure our initial state is correct

Let's get started.

## Using `pushState`

As of the time of writing, the [re-frame docs](https://github.com/Day8/re-frame/blob/d9cdb53/docs/Navigation.md) have 
suggested the following snippet for navigating between panels in an app:

```clojure
(re-frame/reg-event-db
  :set-active-panel
  (fn [db [_ value]]
    (assoc db :active-panel value)))

(re-frame/dispatch 
  [:set-active-panel :panel1])


(re-frame/reg-sub
  :active-panel
  (fn [db _]
    (:active-panel db)))

(defn panel1
 []
 [:div  {:on-click #(re-frame/dispatch [:set-active-panel :panel2])}
        "Here" ])

(defn panel2
 []
 [:div "There"])

(defn high-level-view 
  []
  (let [active  (re-frame/subscribe [:active-panel])]
    (fn []
      [:div
       [:div.title   "Heading"]
       (condp = @active                ;; or you could look up in a map
         :panel1   [panel1]
         :panel2   [panel2])])))
 ```
 
There's a couple of different ways we can handle this, but what seems to be the most correct method (at least to me) 
is using re-frame's [effects](https://github.com/Day8/re-frame/blob/master/docs/Effects.md) api.

So what do we need to get this working? We'll need to use `reg-event-fx` to create something very similar to the
existing `:set-active-panel` event handler, have that emit a new effect, and finally `reg-fx` to handle that effect.
I suggest you leave the existing `:set-active-panel` event handler in place, we'll need it again in a minute.
But let's get started with the new event handler:

```clojure
(re-frame/reg-event-fx :navigate-to-panel
  (fn [{:keys [db]} [_ url panel]]
    ;Same as :set-active-panel
    {:db         (assoc db :active-panel panel)
    ;New push state effect
     :push-state [url panel]}))
     
```

Let's add a effect handler using `reg-fx` to deal with our newly added `:push-state` effect:

```clojure
(re-frame/reg-fx :push-state
  (fn [[url state :as value]]
  ;Grab the history object off the top level window
    (-> (.-history js/window)
        ;Invoke the `pushState` function with...
        (.pushState                     
          ;state object this is stored by the browser
          ;"serialize" some edn by `pr-str`ing it
          (pr-str state)
          ;"title" - currently ignored.
          ""        
          ;the new url we want displayed
          url))))
```

We'll also have to update the existing `on-click` handler:

```clojure 
(defn panel1
  []
                                       ;change the key and add the url
  [:div {:on-click #(re-frame/dispatch [:navigate-to-panel "/panel2" :panel2])}
   "Here"])
```

This is only a part of the wiring we need to do, but it should trigger some of the changes we're looking for.
For starters, you should see the url change to "/panel2" when you click on "Here".
If you open up the browser console and type in `window.history.state` you should see an object with the
value you just passed as the first argument to `pushState` - in this case `":panel2"` 
Clicking the back button won't work yet, we still have to update the application state on `popstate`.

## Handling the `popstate` event

This bit's pretty simple, we just need to make a function that'll consume the event object we're sent by the browser
when the back button is hit.

In this case we can do something like:

```clojure 
(defn handle-pop-state [evt]
  ;`.-state` has what we passed as the first arg to `pushState`
  (let [state (edn/read-string (.-state evt))]      
    (re-frame.core/dispatch [:set-active-panel state])))
```
Hopefully that's understandable. We're just trying to update the application state back to 
what it was before the link was clicked. In this case that just means setting the `:active-panel` key
back to `:panel1`, which we can use the existing `:set-active-panel` event for.

Obviously if your application is more complicated you might need to add more logic than what's in the
sample `:set-active-panel` handler. In fact you could send the whole `db` state. There's a limitation
on the size of the serialized state value (640k characters in Firefox, at least), but you can probably
get quite a bit in there before running into trouble.

In any case, we then need to bind that pop-state handler in the right place:

```clojure
(set! (.-onpopstate js/window) handle-pop-state)
```

I've got this inside my `main` method in my `core.cljs` file. There shouldn't be any issues with rebinding it 
if it gets reloaded by figwheel or anything.

So what happens now? If you try to go back from `:panel2` you should see nothing, and if you look in the console you'll
probably see an error pointing towards the `edn/read-string ` expression in `handle-pop-state`. 

The problem here is the fact that we didn't push any state for the initial page we were on, so when we go back 
(triggering a `popstate`) we get nil for `.-state` which `read-string` rightly barfs on.

Thankfully, the fix is simple.

## Making sure our initial state is correct

Open up a new tab and navigate to the page again, then open the console and enter `window.history.state` again.
You'll get back `null`. This is the cause of the problem we're having.

So what we want to do is add a snippet like so:

```clojure 
(.replaceState (.-history js/window)
                   (pr-str :panel1)     ; state, will replace the initial null state
                   "")                  ; title
```

This will replace the initial null state with the provided state. You can put this at the top level, or inside your
main function. This should make the back button work perfectly. Only problem you might run into is if you're using
something like figwheel to hot reload the page. On this case this chunk of code will execute every time the page 
reloads, smashing the actual current state. To fix this we can simply wrap it with a conditional statement:

```clojure
(when (nil? (-> js/window (.-history) (.-state)))
    (.replaceState (.-history js/window)
                   (pr-str {:handler :home})
                   ""))
```


## Wrapping up

So that should be enough to get you started at least. When used as part of a larger application, there's going to be
some more wrinkles of course. You'll probably have more state that needs to be rolled back as part of heading back - 
this should just mean that the `panel` argument becomes a map that's merged with the re-frame db. 
There's also concerns around urls, parsing values out of them, and what to do when the user first lands on a page
that _isn't_ the root page. I haven't got all the answers for those just yet, but I've started grappling with them 
and I'm hopeful I'll be able to write another post with some of the answers soon.

If you liked this, or if you've just got any questions, please let me know. The best way to reach me is probably on
[Twitter](https://twitter.com/lfln3) - DMs are open.
