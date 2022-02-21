import React, { useState } from 'react';
// import Modal from '../utils/Modal';
// import HeroImage from '../images/hero-image.png';

function HeroHome() {

  // const [videoModalOpen, setVideoModalOpen] = useState(false);
  return (
    <section className="relative">

      <div className="mx-auto">
        {/* Hero content */}
        <div className="pt-12 pb-12 md:pt-20 md:pb-20">

          {/* Section header */}
          <div className="text-center pb-12 md:pb-16">

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4" data-aos="zoom-y-out">
            An easiest <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">Web3 content community</span>
            </h1>

            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 mb-8" data-aos="zoom-y-out" data-aos-delay="150">
              Donate the authors you like, get rewards if you are early supporters of an article.<br/>
              And you can also join Creator DAO and co-build a better content community.
              </p>

              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                  <a className="btn text-white bg-blue-500 hover:bg-blue-700 rounded p-4 shadow-lg w-full mt-4 mb-4 sm:w-auto sm:mb-0" href="/articles-all">Start Explore</a>
              </div>
            </div>
          </div>

        </div>

{/*        <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
          <h2 className="h2 mb-4">What is CCNP for author?</h2>
          <p className="text-xl text-gray-600">At CCNP, you can got Web3 donation easily.</p>
          <p className="text-xl text-gray-600">And you also join Creator DAO and connect with more authors.</p>
        </div>
        <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
          <h2 className="h2 mb-4">What is CCNP for readers?</h2>
          <p className="text-xl text-gray-600">
              Support & donate the authors you like with Web3 in easist way.<br/>
              If you are early supporters of a author, you will get rewards too.
          </p>
        </div>
*/}
      </div>

    </section>
  );
}

export default HeroHome;