// @ts-ignore
import React from "react";

export const FilterHistory = () => {
  return (
    <div className="absolute top-0 left-0 bg-black/30 w-full h-screen flex flex-col justify-end">
      <div className="bg-background_primary flex flex-col p-8 gap-8 rounded-t-2xl">
        {/* header  */}
        <h3 className="text-center text-xl">Filter History</h3>
        {/* content  */}
        <section className="">
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Delivery</legend>
            <div className="">
              <label
                htmlFor=""
                className="flex items-center justify-between gap-4 rounded border border-gray-300 bg-white p-3 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 has-checked:border-blue-600 has-checked:ring-1 has-checked:ring-blue-600 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <p>Daily</p>
                <input
                  type="radio"
                  name="DeliveryOption"
                  value="DeliveryStandard"
                  id="DeliveryStandard"
                  className="size-5 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:ring-offset-gray-900 dark:checked:bg-blue-600"
                  defaultChecked
                />
              </label>
            </div>
            <div className="">
              <label
                htmlFor=""
                className="flex items-center justify-between gap-4 rounded border border-gray-300 bg-white p-3 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 has-checked:border-blue-600 has-checked:ring-1 has-checked:ring-blue-600 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <p>Received</p>
                <input
                  type="radio"
                  name="DeliveryOption"
                  value="DeliveryStandard"
                  id="DeliveryStandard"
                  className="size-5 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:ring-offset-gray-900 dark:checked:bg-blue-600"
                  defaultChecked
                />
              </label>
            </div>
            <div className="">
              <label
                htmlFor=""
                className="flex items-center justify-between gap-4 rounded border border-gray-300 bg-white p-3 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 has-checked:border-blue-600 has-checked:ring-1 has-checked:ring-blue-600 dark:border-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <p>Sent</p>
                <input
                  type="radio"
                  name="DeliveryOption"
                  value="DeliveryStandard"
                  id="DeliveryStandard"
                  className="size-5 border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:ring-offset-gray-900 dark:checked:bg-blue-600"
                  defaultChecked
                />
              </label>
            </div>
          </fieldset>
        </section>
      </div>
    </div>
  );
};
