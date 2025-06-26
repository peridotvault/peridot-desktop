// @ts-ignore
import React, { useState } from "react";
import { InputFieldComponent } from "../../components/atoms/InputFieldComponent";
import {
  faBrain,
  faCheck,
  faCodeBranch,
  faHeading,
  faMessage,
  faMoneyBill1Wave,
  faPersonCane,
  faTurnUp,
} from "@fortawesome/free-solid-svg-icons";
import { PhotoFieldComponent } from "../../components/atoms/PhotoFieldComponent";
import { DropDownComponent } from "../../components/atoms/DropDownComponent";
import { MultiSelectComponent } from "../../components/atoms/MultiSelectComponent";
import allTags from "./../../assets/json/app/tags.json";
import allCategories from "./../../assets/json/app/categories.json";
import { Option } from "../../interfaces/Additional";

export const CreateApp = () => {
  const status = [
    { code: "accept", name: "Accept" },
    { code: "pending", name: "Pending" },
    { code: "decline", name: "Decline" },
  ];
  const osOptions = [
    { value: "windows", label: "Windows" },
    { value: "macos", label: "MacOs" },
    { value: "linux", label: "Linux" },
    { value: "browser", label: "Browser" },
  ];

  const tagOptions = allTags.tags.map((tag) => ({ value: tag, label: tag }));
  const categoryOptions = allCategories.categories.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Option[]>([]);
  const [selectedOS, setSelectedOS] = useState<Option[]>([]);

  return (
    <div className="w-full flex justify-center p-8">
      <form
        onSubmit={() => {
          console.log("submitt");
        }}
        className="container flex flex-col gap-8"
      >
        <h1 className="text-3xl pb-4">Create a new App</h1>
        <div className="flex gap-12">
          {/* left side  */}
          <div className="flex flex-col gap-8 w-2/3">
            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold pb-2">General</h2>
              <InputFieldComponent
                name=""
                icon={faHeading}
                type="text"
                placeholder="Title"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faMessage}
                type="text"
                placeholder="description"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faMoneyBill1Wave}
                type="number"
                placeholder="Price"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faPersonCane}
                type="number"
                placeholder="Required Age"
                value=""
                onChange={() => {}}
              />
            </section>
            <section className="flex flex-col gap-4">
              <hr className="border-t border-background_disabled" />
              <h2 className="text-2xl font-semibold pb-2">Category</h2>
              <MultiSelectComponent
                maxValue={2}
                placeholder="Category"
                selected={selectedCategories}
                options={categoryOptions}
                onChange={setSelectedCategories}
              />
              <MultiSelectComponent
                maxValue={15}
                placeholder="Tags"
                selected={selectedTags}
                options={tagOptions}
                onChange={setSelectedTags}
              />
            </section>
            <section className="flex flex-col gap-4">
              <hr className="border-t border-background_disabled" />
              <h2 className="text-2xl font-semibold pb-2">Manifest</h2>
              <InputFieldComponent
                name=""
                icon={faCodeBranch}
                type="number"
                placeholder="Version"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faTurnUp}
                type="number"
                placeholder="Size"
                value=""
                onChange={() => {}}
              />
            </section>
            <section className="flex flex-col gap-4">
              <hr className="border-t border-background_disabled" />
              <h2 className="text-2xl font-semibold pb-2">Requirements</h2>
              <MultiSelectComponent
                maxValue={osOptions.length}
                placeholder="Operation System"
                options={osOptions}
                selected={selectedOS}
                onChange={setSelectedOS}
              />
              <InputFieldComponent
                name=""
                icon={faBrain}
                type="text"
                placeholder="Processor"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faBrain}
                type="text"
                placeholder="Memory"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faBrain}
                type="number"
                placeholder="Storage"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faBrain}
                type="text"
                placeholder="Graphics"
                value=""
                onChange={() => {}}
              />
              <InputFieldComponent
                name=""
                icon={faBrain}
                type="text"
                placeholder="Additional Notes"
                value=""
                onChange={() => {}}
              />
            </section>
            <section className="flex flex-col gap-4">
              <hr className="border-t border-background_disabled" />
              <h2 className="text-2xl font-semibold pb-2">Status</h2>
              <DropDownComponent
                name="status"
                icon={faCheck}
                placeholder="Status"
                className=""
                value={""}
                options={status}
                onChange={() => {}}
              />
            </section>
            {/* submit button  */}
            <button
              type="submit"
              className="shadow-flat-sm my-12 p-4 rounded-md"
            >
              Submit
            </button>
          </div>
          {/* right side  */}
          <div className="w-1/3">
            <PhotoFieldComponent
              title="Cover Image"
              image_url=""
              setImageUrl={() => {}}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
