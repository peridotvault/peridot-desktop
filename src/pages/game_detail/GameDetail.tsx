import React from "react";
import { StarComponent } from "../../components/StarComponent";

export const GameDetail = () => {
  return (
    <main className="flex justify-center">
      <div className="max-w-[1400px] w-full flex flex-col gap-6">
        <div className="mb-20"></div>
        {/* title */}
        <div className="p-6 flex flex-col gap-3">
          <p className="text-2xl font-bold">Assassin Creed</p>
          <StarComponent rate={4} />
        </div>
        {/* menu */}
        <section className="px-6 flex gap-6">
          {/* overview  */}
          <div className="w-3/4 h-52 bg-red-300"></div>
          {/* right side  */}
          <div className="w-1/4 min-w-[300px] h-52">
            <div className="flex border border-text_disabled/50 p-6 rounded-xl items-start gap-4 ">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQll4aojWlhPmKpt6mBEgv1HSk55vIHpG92aY3w-zTsmTUwGs7bv31r8qluHXf6g1SezkY&usqp=CAU"
                alt=""
                className="w-10 object-contain"
              />
              <div className="flex flex-col gap-2">
                <p className="font-bold">Everyone</p>
                <hr className="border-text_disabled/50" />
                <p>
                  A safe game for all, although it may contain some mild
                  violence or more complex themes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
