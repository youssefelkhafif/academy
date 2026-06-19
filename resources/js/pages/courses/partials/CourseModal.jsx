import { Plus, Save, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export default function CourseModal({
    open,
    onOpenChange,
    form,
    isEditing,
    onSubmit,
    onUpdateField,
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit course' : 'Create course'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the reusable course shell.'
                            : 'Create a reusable course for the catalog.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Title" error={form.errors.title}>
                            <Input
                                value={form.data.title}
                                onChange={(event) =>
                                    onUpdateField('title', event.target.value)
                                }
                                placeholder="Full-Stack JavaScript"
                            />
                        </Field>

                        <Field label="Slug" error={form.errors.slug}>
                            <Input
                                value={form.data.slug}
                                onChange={(event) =>
                                    onUpdateField(
                                        'slug',
                                        slugify(event.target.value),
                                    )
                                }
                                placeholder="full-stack-javascript"
                            />
                        </Field>
                    </div>

                    <Field label="Description" error={form.errors.description}>
                        <textarea
                            value={form.data.description}
                            onChange={(event) =>
                                onUpdateField('description', event.target.value)
                            }
                            placeholder="What learners will build, practice, and master."
                            className="min-h-28 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Banner image"
                            error={form.errors.thumbnail}
                        >
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    onUpdateField(
                                        'thumbnail',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                        </Field>

                        <Field
                            label="Estimated duration"
                            error={form.errors.estimated_duration_days}
                        >
                            <Input
                                type="number"
                                min="1"
                                value={form.data.estimated_duration_days}
                                onChange={(event) =>
                                    onUpdateField(
                                        'estimated_duration_days',
                                        event.target.value,
                                    )
                                }
                                placeholder="10 days"
                            />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Status" error={form.errors.status}>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    onUpdateField('status', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="assigned">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            <X />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-alpha"
                        >
                            {isEditing ? <Save /> : <Plus />}
                            {form.processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Save changes'
                                  : 'Create course'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}
