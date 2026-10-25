'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogPostSchema, type BlogPostFormData } from '@/lib/validations/blog.schema';
import type { BlogCategory } from '@/lib/dto';

interface BlogPostFormProps {
  categories: BlogCategory[];
  defaultValues?: Partial<BlogPostFormData>;
  onSubmit: (data: BlogPostFormData) => void;
  isPending: boolean;
  submitLabel?: string;
}

export function BlogPostForm({
  categories,
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = 'Save Post',
}: BlogPostFormProps) {
  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      categoryId: '',
      title: '',
      content: '',
      slug: '',
      excerpt: '',
      status: 'draft',
      coverImageUrl: '',
      ...defaultValues,
    },
  });

  const errors = form.formState.errors;
  const messages = Object.values(errors)
    .map((issue) => issue?.message)
    .filter((message): message is string => Boolean(message));
  const cover = form.watch('coverImageUrl');

  return (
    <form className="card stack" noValidate onSubmit={form.handleSubmit(onSubmit)}>
      {messages.length > 0 ? (
        <div className="errsum" role="alert">
          <b>Fix these fields</b>
          <ul>
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="bp-title">Title</label>
        <input
          id="bp-title"
          className={errors.title ? 'input err' : 'input'}
          placeholder="A clear, specific headline"
          {...form.register('title')}
        />
        {errors.title ? <span className="hint err">{errors.title.message}</span> : null}
      </div>

      <div className="field">
        <label htmlFor="bp-excerpt">
          Excerpt <span className="faint">(optional)</span>
        </label>
        <input
          id="bp-excerpt"
          className={errors.excerpt ? 'input err' : 'input'}
          placeholder="Short description for listing pages"
          {...form.register('excerpt')}
        />
        {errors.excerpt ? <span className="hint err">{errors.excerpt.message}</span> : null}
      </div>

      <div className="grid g2">
        <div className="field">
          <label htmlFor="bp-category">Category</label>
          <select
            id="bp-category"
            className={errors.categoryId ? 'input err' : 'input'}
            {...form.register('categoryId')}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <span className="hint err">{errors.categoryId.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="bp-status">Status</label>
          <select id="bp-status" className="input" {...form.register('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="bp-slug">
          Slug <span className="faint">(optional)</span>
        </label>
        <input
          id="bp-slug"
          className={errors.slug ? 'input err' : 'input'}
          placeholder="auto-generated-from-title"
          {...form.register('slug')}
        />
        {errors.slug ? <span className="hint err">{errors.slug.message}</span> : null}
      </div>

      <div className="field">
        <label htmlFor="bp-cover">
          Cover image URL <span className="faint">(optional)</span>
        </label>
        <input
          id="bp-cover"
          className={errors.coverImageUrl ? 'input err' : 'input'}
          placeholder="https://"
          {...form.register('coverImageUrl')}
        />
        {errors.coverImageUrl ? <span className="hint err">{errors.coverImageUrl.message}</span> : null}
        {cover ? (
          <img src={cover} alt="Cover preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8 }} />
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="bp-body">Content</label>
        <textarea
          id="bp-body"
          className={errors.content ? 'input err' : 'input'}
          style={{ minHeight: 220 }}
          placeholder="Write the post. Separate paragraphs with a blank line."
          {...form.register('content')}
        />
        {errors.content ? <span className="hint err">{errors.content.message}</span> : null}
      </div>

      <div className="row end">
        <button
          type="submit"
          className={isPending ? 'btn primary nt-loading' : 'btn primary'}
          data-variant="primary"
          disabled={isPending}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
