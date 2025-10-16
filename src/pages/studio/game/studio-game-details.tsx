// @ts-ignore
import React from 'react';
import { ButtonWithSound } from '../../../components/atoms/button-with-sound';
import { InputFloating } from '../../../components/atoms/input-floating';
import { InputTextarea } from '../../../components/atoms/input-textarea';
import { InputImage } from '../../../components/atoms/input-image';
import { InputDropdown } from '../../../components/atoms/input-dropdown';
import tagsData from './../../../assets/json/app/tags.json';
import categoriesData from './../../../assets/json/app/categories.json';
import { useParams } from 'react-router-dom';
import { DraftService } from '../../../local-db/game/services/draft-services';
import { readStringArray } from '../../../lib/helpers/helper-pgl1';
import { handleAssetChange } from '../../../services/studio/detail-service';

export default function StudioGameDetails() {
  const { gameId } = useParams<{ gameId: string }>();
  if (!gameId) {
    // redirect atau tampilkan error
    return <div>Invalid game ID</div>;
  }

  // --- State Form ---
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState<number | ''>('');
  const [age, setAge] = React.useState<number | ''>('');
  const [website, setWebsite] = React.useState('');
  const [bannerUrl, setBannerUrl] = React.useState<string>('');
  const [coverVerticalUrl, setCoverVerticalUrl] = React.useState<string>('');
  const [coverHorizontalUrl, setCoverHorizontalUrl] = React.useState<string>('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  // --- Load draft saat mount ---
  React.useEffect(() => {
    const loadDraft = async () => {
      const draft = await DraftService.get(gameId!);
      if (draft) {
        setName(draft.pgl1_name ?? '');
        setDescription(draft.pgl1_description ?? '');
        setPrice(draft.pgl1_price ?? '');
        setAge(draft.pgl1_required_age ?? '');
        setWebsite(draft.pgl1_website ?? '');
        setBannerUrl(draft.pgl1_banner_image ?? '');
        setCoverVerticalUrl(draft.pgl1_cover_vertical_image ?? '');
        setCoverHorizontalUrl(draft.pgl1_cover_horizontal_image ?? '');
        setTags(readStringArray(draft.pgl1_metadata, 'pgl1_tags'));
        setCategories(readStringArray(draft.pgl1_metadata, 'pgl1_categories'));
      }
    };
    loadDraft();
  }, [gameId]);

  // --- Simpan ke draft ---
  const handleSaveDraft = async () => {
    try {
      await DraftService.updateGeneral(gameId!, {
        pgl1_name: name || undefined,
        pgl1_description: description || undefined,
        pgl1_price: price === '' ? undefined : Number(price),
        pgl1_required_age: age === '' ? undefined : Number(age),
        pgl1_website: website || undefined,
        pgl1_cover_vertical_image: coverVerticalUrl || undefined,
        pgl1_cover_horizontal_image: coverHorizontalUrl || undefined,
        pgl1_banner_image: bannerUrl || undefined,
        categories, // ← ini akan disimpan ke metadata
        tags, // ← ini akan disimpan ke metadata
      });

      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert('Failed to save draft');
    }
  };

  const handleBannerChange = async (files: File[]) => {
    if (files[0]) {
      const apiUrl = await handleAssetChange({
        file: files[0],
        fileNameBase: 'banner',
        gameId: gameId,
      });
      if (apiUrl) setBannerUrl(apiUrl);
    }
  };

  const handleCoverVerticalChange = async (files: File[]) => {
    if (files[0]) {
      const apiUrl = await handleAssetChange({
        file: files[0],
        fileNameBase: 'cover-vertical',
        gameId: gameId,
      });
      if (apiUrl) setCoverVerticalUrl(apiUrl);
    }
  };

  const handleCoverHorizontalChange = async (files: File[]) => {
    if (files[0]) {
      const apiUrl = await handleAssetChange({
        file: files[0],
        fileNameBase: 'cover-horizontal',
        gameId: gameId,
      });
      if (apiUrl) setCoverHorizontalUrl(apiUrl);
    }
  };

  // --- Options dropdown ---
  const categoryOptions = categoriesData.categories.flatMap((cat) =>
    cat.subgenres.map((sg) => ({ value: `${cat.id}:${sg}`, label: sg, group: cat.name })),
  );

  const HeaderContainer = ({ title, description }: { title: string; description: string }) => {
    return (
      <div>
        <h2 className="text-2xl mb-2">{title}</h2>
        <p className="text-foreground/70">{description}</p>
      </div>
    );
  };
  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-14">
        {/* Header  */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Game Details</h1>
            <p className="text-foreground/70">This information appears on PeridotVault</p>
          </div>
          <ButtonWithSound
            onClick={handleSaveDraft}
            className="bg-card-foreground text-card font-bold py-2 px-6 rounded-md cursor-pointer"
          >
            <span>Save to Draft</span>
          </ButtonWithSound>
        </section>

        {/* General  */}
        <section className="grid gap-8">
          <HeaderContainer
            title="General"
            description="Information General your game. all fields are mandatory"
          />
          <div className="grid grid-cols-2 gap-6">
            <div className="">
              <div className="grid grid-cols-2 gap-6">
                <InputFloating
                  placeholder="Game Id"
                  type="text"
                  value={gameId}
                  className="col-span-2"
                  required
                  disabled
                />
                <InputFloating
                  placeholder="Game Name"
                  className="col-span-2"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <InputFloating
                  placeholder="Price (PER)"
                  type="number"
                  value={price}
                  // onChange={(e) => setPrice(e.target.valueAsNumber || '')}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    setPrice(isNaN(val) ? '' : val);
                  }}
                  required
                />
                <InputFloating
                  placeholder="Minimum Age"
                  type="number"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber;
                    setAge(isNaN(val) ? '' : val);
                  }}
                  required
                />
                <InputFloating
                  placeholder="Website link"
                  type="text"
                  className="col-span-2"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="grid gap-6">
                <InputTextarea
                  placeholder="Game Full Description"
                  helperText="More in depth description of your game."
                  autoGrow
                  rows={5}
                  maxRows={10}
                  showCharCount
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Game Cover and Banner  */}
        <section className="grid gap-8">
          <HeaderContainer
            title="Game Cover and Banner"
            description="Upload cover for your game page on PeridotVault"
          />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-3">
              <InputImage
                label="Banner Image"
                accept="image/png,image/jpeg"
                className="aspect-[4/1]"
                required
                multiple={false}
                helperText="Preferably image but gif is also acceptable. Upload must be a 4:1 aspect ratio."
                onChange={handleBannerChange}
                previewUrl={bannerUrl}
              />
            </div>
            <InputImage
              label="Cover Vertical"
              accept="image/png,image/jpeg"
              className="aspect-[3/4]"
              required
              multiple={false}
              helperText="Image must in 3:4 aspect ratio format."
              onChange={handleCoverVerticalChange}
              previewUrl={coverVerticalUrl}
            />
            <div className="col-span-2">
              <InputImage
                label="Cover Horizontal"
                accept="image/png,image/jpeg"
                className="aspect-video"
                required
                multiple={false}
                helperText="Preferably image but gif is also acceptable. Upload must be a 16:9 aspect ratio."
                onChange={handleCoverHorizontalChange}
                previewUrl={coverHorizontalUrl}
              />
            </div>
          </div>
        </section>

        {/* Discovery Metadata  */}
        <section className="grid gap-8">
          <HeaderContainer
            title="Discovery Metadata"
            description="Tag your game to make it easier to find on PeridotVault"
          />
          <div className="grid grid-cols-2 gap-6">
            <InputDropdown
              label="Tags"
              placeholder="Search Tags..."
              options={tagsData.tags} // string[]
              value={tags}
              required
              onChange={setTags}
              maxSelected={6}
            />
            <InputDropdown
              label="Categories"
              placeholder="Search Categories..."
              options={categoryOptions} // grouped
              required
              value={categories}
              onChange={setCategories}
              maxSelected={3}
            />
          </div>
        </section>
        <div className="mb-8"></div>
      </div>
    </div>
  );
}
