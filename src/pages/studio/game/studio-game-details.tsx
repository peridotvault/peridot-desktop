// @ts-ignore
import React, { useState } from 'react';
import { ButtonWithSound } from '../../../shared/components/ui/button-with-sound';
import { InputFloating } from '../../../shared/components/ui/input-floating';
import { InputTextarea } from '../../../shared/components/ui/input-textarea';
import { InputImage } from '../../../components/atoms/input-image';
import { InputDropdown } from '../../../shared/components/ui/input-dropdown';
import { useParams } from 'react-router-dom';
import { handleAssetChange } from '../../../services/studio/detail-service';
import { fetchCategories, fetchTags, updateGeneral } from '../../../features/game/api/game-draft.api';
import { CategoryDraft, TagDraft } from '../../../lib/interfaces/game-draft.types';
import { LoadingComponent } from '../../../components/atoms/loading.component';
import { fetchDraftGeneralCombined } from '@features/game/services/draft.service';

export default function StudioGameDetails() {
  const { gameId } = useParams<{ gameId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
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

  const [listCategoryOptions, setListCategoryOptions] = React.useState<CategoryDraft[]>([]);
  const [listTagOptions, setListTagOptions] = React.useState<TagDraft[]>([]);

  // --- Load draft saat mount ---
  const loadDraft = async () => {
    try {
      setLoading(true);
      const categoryPayload = await fetchCategories();
      const tagPayload = await fetchTags();

      const categoryOptions = categoryPayload.categories ?? [];
      const tagOptions = tagPayload.tags ?? [];

      setListCategoryOptions(categoryOptions);
      setListTagOptions(tagOptions);

      const { data } = await fetchDraftGeneralCombined(gameId!);

      const normalizeSelection = <T,>(
        incoming: unknown[] | undefined,
        options: T[],
        getId: (opt: T) => string,
        getLabel: (opt: T) => string,
      ): string[] => {
        if (!incoming?.length || !options.length) return [];

        const idSet = new Set(options.map((opt) => getId(opt)));
        const labelMap = new Map(
          options.map((opt) => [getLabel(opt).toLowerCase(), getId(opt)]),
        );

        const extractRaw = (value: unknown): string | null => {
          if (value === null || value === undefined) return null;
          if (typeof value === 'string' && value.trim()) return value.trim();
          if (typeof value === 'number') return value.toString();
          if (typeof value === 'object') {
            const obj = value as Record<string, unknown>;
            const possibleKeys = ['id', 'value', 'category_id', 'tag_id', 'name'];
            for (const key of possibleKeys) {
              const raw = obj[key];
              if (typeof raw === 'string' && raw.trim()) return raw.trim();
            }
          }
          return null;
        };

        const normalized: string[] = [];
        incoming.forEach((entry) => {
          const raw = extractRaw(entry);
          if (!raw) return;
          if (idSet.has(raw)) {
            normalized.push(raw);
            return;
          }
          const labelHit = labelMap.get(raw.toLowerCase());
          if (labelHit) normalized.push(labelHit);
        });

        return Array.from(new Set(normalized));
      };

      setName(data.name ?? '');
      setDescription(data.description ?? '');
      setPrice(typeof data.price === 'number' ? data.price : '');
      setAge(typeof data.required_age === 'number' ? data.required_age : '');
      setWebsite(data.website ?? '');
      setBannerUrl(data.banner_image ?? '');
      setCoverVerticalUrl(data.cover_vertical_image ?? '');
      setCoverHorizontalUrl(data.cover_horizontal_image ?? '');
      setTags(
        normalizeSelection(
          Array.isArray(data.tags) ? (data.tags as unknown[]) : [],
          tagOptions,
          (tag) => tag.tag_id,
          (tag) => tag.name,
        ),
      );
      setCategories(
        normalizeSelection(
          Array.isArray(data.categories) ? (data.categories as unknown[]) : [],
          categoryOptions,
          (cat) => cat.category_id,
          (cat) => cat.name,
        ),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDraft();
  }, [gameId]);

  // --- Simpan ke draft ---
  const handleSaveDraft = async () => {
    try {
      // await DraftService.updateGeneral(gameId!, {
      await updateGeneral(gameId!, {
        name: name || undefined,
        description: description || undefined,
        price: price === '' ? undefined : Number(price),
        required_age: age === '' ? undefined : Number(age),
        website: website || undefined,
        cover_vertical_image: coverVerticalUrl || undefined,
        cover_horizontal_image: coverHorizontalUrl || undefined,
        banner_image: bannerUrl || undefined,
        categories: categories.filter((cat) => !!cat),
        tags: tags.filter((tag) => !!tag),
      });

      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert('Failed to save draft');
    }
  };

  const handleBannerChange = async (files: File[]) => {
    if (files.length === 0) {
      setBannerUrl('');
      return;
    }

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
    if (files.length === 0) {
      setCoverVerticalUrl('');
      return;
    }

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
    if (files.length === 0) {
      setCoverHorizontalUrl('');
      return;
    }

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

        {loading ? (
          <LoadingComponent />
        ) : (
          <div className="flex flex-col gap-14">
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
                    key={bannerUrl}
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
                  key={coverVerticalUrl}
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
                    key={coverHorizontalUrl}
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
                  options={listTagOptions.map((tag) => ({
                    value: tag.tag_id,
                    label: tag.name,
                  }))} // string[]
                  value={tags}
                  required
                  onChange={setTags}
                  maxSelected={6}
                />
                <InputDropdown
                  label="Categories"
                  placeholder="Search Categories..."
                  options={listCategoryOptions.map((cat) => ({
                    value: cat.category_id,
                    label: cat.name,
                  }))} // grouped
                  required
                  value={categories}
                  onChange={setCategories}
                  maxSelected={3}
                />
              </div>
            </section>
          </div>
        )}

        <div className="mb-8"></div>
      </div>
    </div>
  );
}
