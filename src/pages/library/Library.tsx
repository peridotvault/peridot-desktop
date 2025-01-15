// @ts-ignore
import React from "react";

export const Library = () => {
  return (
    <div className="flex justify-center">
      <div className="container">
        {/* Recent  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">Recently you play</p>
          <div className="flex flex-wrap gap-8">
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
          </div>
        </section>

        {/* Library  */}
        <section className="px-6 py-4 flex flex-col gap-4">
          <p className="text-xl font-medium">My Games (5)</p>
          <div className="flex flex-wrap gap-8">
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
            <button className="w-[170px] bg-background_secondary rounded-xl overflow-hidden">
              <img
                src="https://m.media-amazon.com/images/I/81s28Eg93NL.jpg"
                alt=""
                className="aspect-[3/4] object-cover"
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
