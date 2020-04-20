![clio logo](https://github.com/bhaprayan/clio/blob/master/images/logo.png)

# Clio - A Virtual Librarian

> If I finish a book a week, I will read only a few thousand books in my lifetime, about a tenth of a percent of the contents of the greatest libraries of our time. The trick is to know which books to read.        —Carl Sagan

clio is a browser plugin that processes search history and makes personalized book recommendations based on what you've been reading.

## Build

```
yarn install
browserify popup.js -o bundle.js
```

## Install

1. Navigate to `chrome://extensions`
2. Click install unpacked extensions and select this repository through the file tree popup.
3. That's it! Enjoy :)

## Behind the Scenes

1. We pull your browser history using Chrome Extension APIs.
2. We make requests, to visited URLs over a time window, and parse the pages.
3. We extract topics based on these which we store on your client.
4. We then generate recommendations through these stored topics.

## Note

* All search history processing is done on the client (i.e. your browser). You don't have to worry about privacy concerns.
* In the future we aim to move to more sophisticated ML models to recommend topics, in which case we plan to move over to a backend stack based on differentially private ML. TLDR: we care about the privacy of your data :)
