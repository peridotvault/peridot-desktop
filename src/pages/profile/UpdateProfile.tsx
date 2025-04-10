// @ts-ignore
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import { useWallet } from "../../contexts/WalletContext";
import {
  updateUser,
  getUserByPrincipalId,
  MetadataUpdateUser,
  GenderVariant,
  isUsernameValid,
} from "../../contexts/UserContext";
import {
  faEarthAsia,
  faEnvelope,
  faSeedling,
  faTv,
  faUser,
  faVenusMars,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import countriesData from "../../assets/json/countries.json";
import { LoadingScreen } from "../additional/LoadingScreen";
import {
  getCoverImage,
  getProfileImage,
} from "../../components/AdditionalComponent";
import { TransactionSuccess } from "../additional/TransactionSuccess";
import { TransactionFailed } from "../additional/TransactionFailed";

interface CountryOption {
  code: string;
  name: string;
}

interface UserDataInterface {
  ok: {
    username: string;
    display_name: string;
    email: string;
    image_url: string;
    background_image_url: string;
    total_playtime: number;
    created_at: string;
    user_demographics: {
      birth_date: number;
      gender: {
        male: null | undefined;
        female: null | undefined;
        other: null | undefined;
      };
      country: string;
    };
    user_interactions: [
      {
        app_id: string;
        interaction: string;
        created_at: string;
      }
    ];
    user_libraries: string;
    developer: string;
  };
}

const AccountSettingsInputField = ({
  name,
  icon,
  type,
  placeholder,
  className,
  value,
  onChange,
}: {
  name: string;
  icon: IconDefinition;
  type: string;
  placeholder: string;
  className: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
  return (
    <section className="flex flex-col gap-3">
      <p className="capitalize font-semibold">
        {placeholder} <label className="text-accent_primary"> *</label>
      </p>
      <div className="flex rounded-xl overflow-hidden border border-text_disabled/30">
        <div className="h-14 w-14 flex justify-center items-center">
          <FontAwesomeIcon icon={icon} className="text-text_disabled" />
        </div>
        <input
          type={type}
          name={name}
          className={`w-full bg-transparent shadow-sunken-sm px-3 ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </section>
  );
};

const AccountSettingsDropdownField = ({
  name,
  icon,
  placeholder,
  className,
  value,
  options,
  onChange,
}: {
  name: string;
  icon: IconDefinition;
  placeholder: string;
  className: string;
  value: string | GenderVariant;
  options: { code: string; name: string }[];
  onChange: ChangeEventHandler<HTMLSelectElement>;
}) => {
  const displayValue =
    name === "gender" && typeof value === "object"
      ? Object.keys(value)[0]
      : String(value);
  return (
    <section className="flex flex-col gap-3">
      <p className="capitalize font-semibold">
        {placeholder} <label className="text-accent_primary"> *</label>
      </p>
      <div className="flex rounded-xl overflow-hidden border border-text_disabled/30">
        <div className="h-14 w-14 flex justify-center items-center">
          <FontAwesomeIcon icon={icon} className="text-text_disabled" />
        </div>
        <select
          name={name}
          className={`w-full bg-transparent shadow-sunken-sm px-3 ${className}`}
          value={displayValue}
          onChange={onChange}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export const UpdateProfile = () => {
  const { wallet } = useWallet();
  const [userData, setUserData] = useState<UserDataInterface | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [metadataUpdateUser, setMetadataUpdateUser] =
    useState<MetadataUpdateUser>({
      username: "",
      display_name: "",
      email: "",
      image_url: "",
      background_image_url: "",
      user_demographics: {
        birth_date: "",
        gender: { other: null },
        country: "",
      },
    });
  const [isValidUsername, setIsValidUsername] = useState({
    valid: true,
    msg: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  function timestampToDateString(timestamp: number): string {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }

  useEffect(() => {
    async function checkUser() {
      if (wallet.encryptedPrivateKey) {
        const isUserExist = await getUserByPrincipalId(
          wallet.encryptedPrivateKey
        );
        if (
          isUserExist &&
          typeof isUserExist === "object" &&
          "ok" in isUserExist
        ) {
          const theUserData = isUserExist as UserDataInterface;
          const genderVariant =
            theUserData.ok.user_demographics.gender.male === null
              ? { male: null }
              : theUserData.ok.user_demographics.gender.female === null
              ? { female: null }
              : { other: null };
          setUserData(userData);
          setMetadataUpdateUser({
            username: theUserData.ok.username,
            display_name: theUserData.ok.display_name,
            email: theUserData.ok.email,
            image_url: theUserData.ok.image_url || "",
            background_image_url: theUserData.ok.background_image_url || "",
            user_demographics: {
              birth_date: timestampToDateString(
                theUserData.ok.user_demographics.birth_date
              ),
              gender: genderVariant,
              country: theUserData.ok.user_demographics.country,
            },
          });
          setIsLoading(false);
        }
      }
    }
    checkUser();
  }, [wallet]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "gender") {
      // Special handling for gender to create the variant structure
      const genderVariant: GenderVariant = {
        [value as keyof GenderVariant]: null,
      } as GenderVariant;
      setMetadataUpdateUser((prev) => ({
        ...prev,
        user_demographics: {
          ...prev.user_demographics,
          gender: genderVariant,
        },
      }));
    } else if (name in metadataUpdateUser.user_demographics) {
      setMetadataUpdateUser((prev) => ({
        ...prev,
        user_demographics: {
          ...prev.user_demographics,
          [name]:
            type === "number" ? (value === "" ? "" : Number(value)) : value,
        },
      }));
    } else {
      setMetadataUpdateUser((prev) => ({
        ...prev,
        [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
      }));
    }
  };

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    imageType: "image_url" | "background_image_url"
  ) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size
      const MAX_FILE_SIZE = 1.5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(
          `File size exceeds 1.5MB limit. Current size: ${currentSizeMB}MB`
        );
        e.target.value = "";
        return;
      }

      // Convert to base64
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert image to base64"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      setMetadataUpdateUser((prev) => ({
        ...prev,
        [imageType]: base64String,
      }));
    } catch (error) {
      console.error("Error handling image upload:", error);
      e.target.value = "";
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    // Validation before submission
    const { username, display_name, email, user_demographics } =
      metadataUpdateUser;
    const { birth_date, gender, country } = user_demographics;

    if (
      !username ||
      !display_name ||
      !email ||
      !birth_date ||
      !gender ||
      !country
    ) {
      alert("Please fill in all fields");
      return;
    }

    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const result = await updateUser(metadataUpdateUser, wallet);
      if (result) {
        // Handle successful creation
        console.log("Account updated successfully");
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      setShowFailed(true);
      setTimeout(() => {
        setShowFailed(false);
      }, 2000);
    }
  };

  const genderOptions: CountryOption[] = [
    { code: "male", name: "Male" },
    { code: "female", name: "Female" },
    { code: "other", name: "Other" },
  ];
  const countryOptions: CountryOption[] = countriesData;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className="pt-20  w-full flex flex-col">
      <div className="flex flex-col items-center">
        {showSuccess ? (
          <TransactionSuccess msg="Account Updated Successfully" />
        ) : (
          ""
        )}
        {showFailed ? <TransactionFailed msg="Account Updated Failed" /> : ""}
        <div className="mb-3 py-6 px-10 border-b border-background_disabled flex justify-between items-center w-full">
          <p className="text-2xl font-semibold">Account Settings</p>
          <button
            onClick={handleSubmit}
            className="w-52 p-3 rounded-xl hover:shadow-arise-sm shadow-flat-sm duration-300 hover:text-white text-text_disabled"
          >
            Submit
          </button>
        </div>
        <div className="container flex gap-10 px-10 pt-3 pb-10">
          <div className="w-1/2 flex flex-col gap-10">
            {/* Profile Photo  */}
            <div className="flex flex-col gap-3">
              <p className="capitalize font-semibold">Profile photo</p>
              <div className="flex justify-center">
                <div className="shadow-arise-sm w-[230px] aspect-square rounded-full overflow-hidden">
                  {metadataUpdateUser.image_url && (
                    <img
                      src={getProfileImage(metadataUpdateUser.image_url)}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "image_url")}
                className="w-full bg-transparent shadow-sunken-sm px-5 mt-3 py-3 rounded-lg"
              />
            </div>
            {/* bg img  */}
            <div className="flex flex-col gap-3">
              <p className="capitalize font-semibold">Background Image</p>
              <div className="flex justify-center">
                <div className="shadow-arise-sm w-full h-[15rem] rounded-xl overflow-hidden">
                  {metadataUpdateUser.background_image_url && (
                    <img
                      src={getCoverImage(
                        metadataUpdateUser.background_image_url
                      )}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "background_image_url")}
                className="w-full bg-transparent shadow-sunken-sm px-5 mt-3 py-3 rounded-lg"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 w-1/2">
            <div className="flex flex-col gap-2">
              <p className="text-xl font-semibold">User Information</p>
              <p className="text-text_disabled">
                Here you can edit public information about yourself The changes
                will be displayed for other users.
              </p>
            </div>
            <div className="">
              <AccountSettingsInputField
                name="username"
                icon={faUser}
                type="text"
                placeholder="username"
                className="lowercase"
                value={metadataUpdateUser.username}
                onChange={async (e) => {
                  handleInputChange(e);
                  const result = await isUsernameValid(e.target.value);
                  if (result && typeof result === "object" && "ok" in result) {
                    setIsValidUsername({ valid: true, msg: "username valid" });
                  } else if (
                    result &&
                    typeof result === "object" &&
                    "err" in result
                  ) {
                    const error = result as { err: { InvalidInput: string } };
                    setIsValidUsername({
                      valid: false,
                      msg: error.err.InvalidInput ?? "Invalid username",
                    });
                  }
                }}
              />
              <p
                className={` ${
                  isValidUsername.valid ? "text-success" : "text-danger"
                }`}
              >
                {isValidUsername.msg}
              </p>
            </div>
            <AccountSettingsInputField
              name="display_name"
              icon={faTv}
              type="text"
              placeholder="Display Name"
              className=""
              onChange={handleInputChange}
              value={metadataUpdateUser.display_name}
            />
            <AccountSettingsInputField
              name="email"
              icon={faEnvelope}
              type="email"
              placeholder="Email"
              className=""
              value={metadataUpdateUser.email}
              onChange={handleInputChange}
            />
            <AccountSettingsInputField
              name="birth_date"
              icon={faSeedling}
              type="date"
              placeholder="Birth Date"
              className=""
              value={metadataUpdateUser.user_demographics.birth_date.toString()}
              onChange={handleInputChange}
            />
            <AccountSettingsDropdownField
              name="gender"
              icon={faVenusMars}
              placeholder="Gender"
              className=""
              value={metadataUpdateUser.user_demographics.gender}
              options={genderOptions}
              onChange={handleInputChange}
            />
            <AccountSettingsDropdownField
              name="country"
              icon={faEarthAsia}
              placeholder="Country"
              className=""
              value={metadataUpdateUser.user_demographics.country}
              options={countryOptions}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
};
