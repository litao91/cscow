(ns com.ociweb.demo
  (:require [clojure.string :as su])
  (:use [clojure.math.numeric-tower :only (gcd sqrt)])
  (:import (java.text NumberFormat) (javax.swing JFrame JLabel)))

(doto (JFrame. "Hello")
  (.add (JLabel. "Hello, world!"))
  (.pack)
  (.setDefaultCloseOperation JFrame/EXIT_ON_CLOSE)
  (.setVisible true))
