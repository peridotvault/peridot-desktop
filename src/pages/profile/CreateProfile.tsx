// @ts-ignore
import React from "react";
import {
  faEarthAsia,
  faEnvelope,
  faSeedling,
  faTv,
  faUser,
  faVenusMars,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CreateProfile = () => {
  return (
    <main className="w-full min-h-dvh flex flex-col justify-center items-center">
      <div className="container flex flex-col justify-center items-center gap-6">
        <p className="text-xl mb-3">Account Center</p>
        {/* Username  */}
        <section className="flex rounded-xl overflow-hidden border border-text_disabled/30">
          <div className="h-14 w-14 flex justify-center items-center">
            <FontAwesomeIcon icon={faUser} className="text-text_disabled" />
          </div>
          <input
            type="text"
            className="w-80 bg-transparent shadow-sunken-sm px-3"
            placeholder="username"
          />
        </section>
        {/* Display Name  */}
        <section className="flex rounded-xl overflow-hidden border border-text_disabled/30">
          <div className="h-14 w-14 flex justify-center items-center">
            <FontAwesomeIcon icon={faTv} className="text-text_disabled" />
          </div>
          <input
            type="text"
            className="w-80 bg-transparent shadow-sunken-sm px-3"
            placeholder="Display Name"
          />
        </section>
        {/* Email  */}
        <section className="flex rounded-xl overflow-hidden border border-text_disabled/30">
          <div className="h-14 w-14 flex justify-center items-center">
            <FontAwesomeIcon icon={faEnvelope} className="text-text_disabled" />
          </div>
          <input
            type="email"
            className="w-80 bg-transparent shadow-sunken-sm px-3"
            placeholder="example@email.com"
          />
        </section>
        {/* Age  */}
        <section className="flex rounded-xl overflow-hidden border border-text_disabled/30">
          <div className="h-14 w-14 flex justify-center items-center">
            <FontAwesomeIcon icon={faSeedling} className="text-text_disabled" />
          </div>
          <input
            type="number"
            className="w-80 bg-transparent shadow-sunken-sm px-3"
            placeholder="Age"
          />
        </section>
        {/* Gender  */}
        <section className="flex rounded-xl overflow-hidden border border-text_disabled/30">
          <div className="h-14 w-14 flex justify-center items-center">
            <FontAwesomeIcon
              icon={faVenusMars}
              className="text-text_disabled"
            />
          </div>
          <input
            type="text"
            className="w-80 bg-transparent shadow-sunken-sm px-3"
            placeholder="Gender"
          />
        </section>
        {/* Country  */}
        <section className="flex rounded-xl overflow-hidden border border-text_disabled/30">
          <div className="h-14 w-14 flex justify-center items-center">
            <FontAwesomeIcon
              icon={faEarthAsia}
              className="text-text_disabled"
            />
          </div>
          <input
            type="text"
            className="w-80 bg-transparent shadow-sunken-sm px-3"
            placeholder="Country"
          />
        </section>
        <button className="w-52 p-3 rounded-xl hover:shadow-arise-sm shadow-flat-sm duration-300 hover:text-white text-text_disabled">
          Submit
        </button>
      </div>
    </main>
  );
};
