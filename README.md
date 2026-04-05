<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/hjplumtree/Affitalink">
    <img src="https://github.com/hjplumtree/Affitalink/blob/main/public/logo.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Affitalink</h3>

  <p align="center">
    Reviewed affiliate offers for publishers
    <br />
    <a href="https://www.affitalink.com/"><strong>Start Affitalink »</strong></a>
    <br />
    <br />

  </p>
</div>

<!-- ABOUT THE PROJECT -->
## What is Affitalink?

Current product direction is documented in [PRODUCT_DIRECTION.md](./PRODUCT_DIRECTION.md).

<img src="https://user-images.githubusercontent.com/8123797/167623292-06d219b8-5e2e-4f2c-91d9-ab66d7abb81c.png" />

AffitaLink is a publisher-side operating system for affiliate offers.

It connects to affiliate networks, ingests offer updates, normalizes them into a canonical offer library, and helps operators decide what is ready to publish to their real destination site.

Here's how:
* Connect the affiliate networks you already use
* Select the merchants you actually care about
* Review incoming updates in one workflow
* Keep a cleaner offer library with normalized fields
* Prepare reviewed inventory for downstream publishing, starting with WordPress

<p align="right">(<a href="#top">back to top</a>)</p>



### Why you need Affitalink

- [x] Advertisers are scattered across multiple network sites. As a result, you might join several network sites. It can increase to 2 to 3 at least and over 10 at most.

- [x] The process of logging in to the network sites and finding the offers you want on different UI can be exhausting.

- [x] Copying raw network offers into a live coupon site is repetitive and easy to get wrong.

- [x] Automation without review creates noise, duplication, and low-quality content.

To reduce this hassle and time, Affitalink was born!

<p align="right">(<a href="#top">back to top</a>)</p>



## Product structure

1. Home
   <p>Explains the product as a publisher tool, not just a feed viewer.</p>

2. Sources
   <p>Displays a list of network sites.
   Press Setting to navigate to the network site connection page.
   Checking is added after API tests</p>
   <img src="https://user-images.githubusercontent.com/8123797/167623614-9dd3e306-b4fd-4cc4-abad-1263732af47d.png" width="500" />
   <br />
   
3. Network site connection page
   <p>For example, to connect to CJ, enter Token, Requestor id and Website id provided by cj.com and press button to connect</p>
   <img src="https://user-images.githubusercontent.com/8123797/167628516-555281d6-4cc4-4fd1-a939-06bc753a00ae.png" width="500" />
   <br />

   <p>By default, you can see a list of all advertisers that are affiliated, but you can filter the advertisers that you want as needed. In other words, you can only see the link of the advertiser you want!</p>
   <p>The selection data is **automatically saved locally**, so you don't need to set again everytime!</p>
   <img src="https://user-images.githubusercontent.com/8123797/167623608-8cc70496-35b2-4288-a817-36a214b9057b.png" width="500" />
   <br />
4. Review
   <p>This is the review queue for incoming offer changes.</p>
   <p>When you fetch links, AffitaLink compares the latest network data and helps you decide what should survive into the library.</p>
   
   <p>(CJ API is not currently sending us the latest offers. I've inquired CJ and will be applied if it's updated)  </p>
   <img src="https://user-images.githubusercontent.com/8123797/167623612-1935e667-0bea-4a41-a027-97c577f5c6d5.png" width="500" />
   <br />

5. Library
   <p>This is the canonical offer library, not necessarily the final public coupon site.</p>
   <p>Library items are normalized, reviewed, and prepared for downstream publishing destinations such as WordPress.</p>
   
<p align="right">(<a href="#top">back to top</a>)</p>





### Built With

This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples.

* [Next.js](https://nextjs.org/)
* [React.js](https://reactjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Supabase](https://supabase.com/)

<p align="right">(<a href="#top">back to top</a>)</p>




<!-- CONTACT -->
## Contact

<p>
  <a href="https://twitter.com/hjplumtree">Twitter</a>
  ·
  <a href="https://www.linkedin.com/in/hjplumtree">Linkedin</a>
</p>

Project Link: [https://github.com/hjplumtree/Affitalink](https://github.com/hjplumtree/Affitalink)

Thanks!

<p align="right">(<a href="#top">back to top</a>)</p>
