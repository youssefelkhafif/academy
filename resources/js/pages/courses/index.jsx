import { Head, router, useForm } from '@inertiajs/react';
import {
    Archive,
    CheckCircle2,
    Edit3,
    Eye,
    FileText,
    Layers3,
    Plus,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ContextActionMenu from '@/components/ContextActionMenu';
import DeleteModal from '@/components/DeleteModal';
import SortViewMenu from '@/components/SortViewMenu';
import { Button } from '@/components/ui/button';
import CourseCard from './partials/CourseCard';
import CourseFilters from './partials/CourseFilters';
import CourseGalleryCard from './partials/CourseGalleryCard';
import CourseModal from './partials/CourseModal';
import CourseReviewModal from './partials/CourseReviewModal';
import CourseStats from './partials/CourseStats';

const emptyCourseForm = {
    title: '',
    slug: '',
    description: '',
    thumbnail: null,
    estimated_duration_days: '',
    status: 'draft',
};

const defaultSort = 'recently_active';
const defaultView = 'banners';

const courseSortOptions = [
    { label: 'Recently Active', value: 'recently_active' },
    { label: 'Date Posted', value: 'date_posted' },
];

const courseViewOptions = [
    { label: 'Banners', value: 'banners' },
    { label: 'Cards', value: 'cards' },
];

const courseFilterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Drafted', value: 'draft' },
    { label: 'Published', value: 'assigned' },
    { label: 'Archived', value: 'archived' },
];

const slugify = (value) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const courseStatus = (status) => (status === 'published' ? 'assigned' : status);

const courseStatusLabel = (status) =>
    ({
        draft: 'Draft',
        assigned: 'Published',
        archived: 'Archived',
    })[courseStatus(status)] ?? 'Draft';

const courseStatusStyles = (status) =>
    ({
        draft: 'border-alpha/40 bg-alpha/10 text-alpha',
        assigned: 'border-good/40 bg-good/10 text-good',
        archived: 'border-muted-foreground/30 bg-muted/40 text-muted-foreground',
    })[courseStatus(status)] ?? 'border-alpha/40 bg-alpha/10 text-alpha';

const normalizeCoursePayload = (data) => {
    const payload = { ...data };

    if (!(payload.thumbnail instanceof File)) {
        delete payload.thumbnail;
    }

    if (payload.estimated_duration_days === '') {
        payload.estimated_duration_days = null;
    }

    return payload;
};

export default function CoursesIndex({ courses = [] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [courseToReview, setCourseToReview] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [courseMenu, setCourseMenu] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [sortValue, setSortValue] = useState(defaultSort);
    const [viewMode, setViewMode] = useState(defaultView);
    const [statusFilter, setStatusFilter] = useState('all');

    const form = useForm(emptyCourseForm);
    const isEditing = Boolean(editingCourse);

    const stats = useMemo(
        () => ({
            total: courses.length,
            assigned: courses.filter(
                (course) => courseStatus(course.status) === 'assigned',
            ).length,
            drafts: courses.filter((course) => course.status === 'draft')
                .length,
        }),
        [courses],
    );

    const visibleCourses = useMemo(() => {
        const timestampFor = (course) => {
            const date =
                sortValue === 'date_posted'
                    ? course.created_at
                    : course.updated_at;

            return new Date(date).getTime() || 0;
        };

        return courses
            .filter((course) => {
                if (statusFilter === 'all') {
                    return true;
                }

                return courseStatus(course.status) === statusFilter;
            })
            .sort((firstCourse, secondCourse) => {
                return timestampFor(secondCourse) - timestampFor(firstCourse);
            });
    }, [courses, sortValue, statusFilter]);

    const openCreateModal = () => {
        setEditingCourse(null);
        form.clearErrors();
        form.setData(emptyCourseForm);
        setModalOpen(true);
    };

    const openEditModal = (course) => {
        setCourseMenu(null);
        setEditingCourse(course);
        form.clearErrors();
        form.setData({
            title: course.title ?? '',
            slug: course.slug ?? '',
            description: course.description ?? '',
            thumbnail: null,
            estimated_duration_days: course.estimated_duration_days ?? '',
            status: courseStatus(course.status) ?? 'draft',
        });
        setModalOpen(true);
    };

    const openCourseMenu = (event, course) => {
        event.preventDefault();

        setCourseMenu({
            item: course,
            x: Math.min(event.clientX, window.innerWidth - 180),
            y: Math.min(event.clientY, window.innerHeight - 112),
        });
    };

    const openCourseMenuFromButton = (event, course) => {
        event.stopPropagation();

        const rect = event.currentTarget.getBoundingClientRect();

        setCourseMenu({
            item: course,
            x: Math.min(rect.right - 180, window.innerWidth - 180),
            y: Math.min(rect.bottom + 8, window.innerHeight - 224),
        });
    };

    const closeCourseModal = () => {
        setModalOpen(false);
        setEditingCourse(null);
        form.clearErrors();
        form.setData(emptyCourseForm);
    };

    const updateField = (field, value) => {
        form.setData(field, value);

        if (field === 'title' && !isEditing) {
            form.setData('slug', slugify(value));
        }
    };

    const submitCourse = (event) => {
        event.preventDefault();

        form.transform(normalizeCoursePayload);

        if (isEditing) {
            form.post(`/courses/${editingCourse.id}/update`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeCourseModal,
                onFinish: () => form.transform((data) => data),
            });

            return;
        }

        form.post('/courses', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeCourseModal,
            onFinish: () => form.transform((data) => data),
        });
    };

    const deleteCourse = () => {
        if (!courseToDelete) {
            return Promise.resolve();
        }

        setDeleteProcessing(true);

        return new Promise((resolve, reject) => {
            router.delete(`/courses/${courseToDelete.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setCourseToDelete(null);
                    resolve();
                },
                onError: (errors) => reject(errors),
                onFinish: () => setDeleteProcessing(false),
            });
        });
    };

    const openReviewModal = (course) => {
        setCourseMenu(null);
        setCourseToReview(course);
    };

    const updateCourseStatus = (course, status) => {
        setCourseMenu(null);

        router.patch(
            `/courses/${course.id}/status`,
            { status },
            { preserveScroll: true },
        );
    };

    const renderCourse = (course) => {
        const cardProps = {
            course,
            statusLabel: courseStatusLabel,
            statusStyles: courseStatusStyles,
            onOpenMenu: (event) => openCourseMenu(event, course),
            onOpenMenuFromButton: (event) =>
                openCourseMenuFromButton(event, course),
            onReview: () => openReviewModal(course),
        };

        return viewMode === 'cards' ? (
            <CourseGalleryCard key={course.id} {...cardProps} />
        ) : (
            <CourseCard key={course.id} {...cardProps} />
        );
    };

    return (
        <>
            <Head title="Courses" />

            <div className="min-h-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-5">
                    <header className="relative overflow-hidden rounded-lg border border-border bg-background shadow-xs">
                        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--color-alpha),transparent_72%)]" />
                        <div className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-alpha uppercase">
                                    <Layers3 className="size-4" />
                                    Coach workspace
                                </div>
                                <h1 className="text-2xl font-semibold text-foreground">
                                    Courses
                                </h1>
                                <p className="max-w-2xl text-sm text-muted-foreground">
                                    Manage reusable courses before assigning
                                    them to promotions.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <CourseStats stats={stats} />
                                <Button
                                    type="button"
                                    className="bg-alpha"
                                    onClick={openCreateModal}
                                >
                                    <Plus />
                                    New course
                                </Button>
                            </div>
                        </div>
                    </header>

                    <section className="overflow-hidden rounded-lg border border-border bg-background shadow-xs">
                        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Course catalog
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {visibleCourses.length} of {courses.length}{' '}
                                    course{courses.length === 1 ? '' : 's'}{' '}
                                    ready to manage.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <CourseFilters
                                    value={statusFilter}
                                    options={courseFilterOptions}
                                    onChange={setStatusFilter}
                                />
                                <SortViewMenu
                                    sortOptions={courseSortOptions}
                                    sortValue={sortValue}
                                    onSortChange={setSortValue}
                                    viewOptions={courseViewOptions}
                                    viewValue={viewMode}
                                    onViewChange={setViewMode}
                                    onReset={() => {
                                        setSortValue(defaultSort);
                                        setViewMode(defaultView);
                                        setStatusFilter('all');
                                    }}
                                />
                            </div>
                        </div>

                        {courses.length === 0 ? (
                            <EmptyCourses onCreate={openCreateModal} />
                        ) : visibleCourses.length === 0 ? (
                            <EmptyFilter />
                        ) : (
                            <div
                                className={
                                    viewMode === 'cards'
                                        ? 'grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3'
                                        : 'grid gap-4 p-4'
                                }
                            >
                                {visibleCourses.map(renderCourse)}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <CourseModal
                open={modalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeCourseModal();
                    } else {
                        setModalOpen(true);
                    }
                }}
                form={form}
                isEditing={isEditing}
                onSubmit={submitCourse}
                onUpdateField={updateField}
            />

            <ContextActionMenu
                menu={courseMenu}
                onClose={() => setCourseMenu(null)}
                actions={[
                    {
                        label: 'Review course',
                        icon: <Eye className="size-4" />,
                        onSelect: (course) => openReviewModal(course),
                    },
                    {
                        label: 'Edit course',
                        icon: <Edit3 className="size-4" />,
                        onSelect: (course) => openEditModal(course),
                    },
                    {
                        label: 'Mark as draft',
                        icon: <FileText className="size-4" />,
                        onSelect: (course) =>
                            updateCourseStatus(course, 'draft'),
                    },
                    {
                        label: 'Publish course',
                        icon: <CheckCircle2 className="size-4" />,
                        onSelect: (course) =>
                            updateCourseStatus(course, 'assigned'),
                    },
                    {
                        label: 'Archive course',
                        icon: <Archive className="size-4" />,
                        onSelect: (course) =>
                            updateCourseStatus(course, 'archived'),
                    },
                    {
                        label: 'Delete course',
                        icon: <Trash2 className="size-4" />,
                        variant: 'danger',
                        onSelect: (course) => {
                            setCourseMenu(null);
                            setCourseToDelete(course);
                        },
                    },
                ]}
                widthClass="w-48"
            />

            <DeleteModal
                open={Boolean(courseToDelete)}
                onOpenChange={(open) => !open && setCourseToDelete(null)}
                title="Delete course"
                description={`Delete "${courseToDelete?.title ?? 'this course'}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                loading={deleteProcessing}
                onConfirm={deleteCourse}
            />

            <CourseReviewModal
                course={courseToReview}
                open={Boolean(courseToReview)}
                onOpenChange={(open) => !open && setCourseToReview(null)}
                statusLabel={courseStatusLabel}
                statusStyles={courseStatusStyles}
            />
        </>
    );
}

function EmptyCourses({ onCreate }) {
    return (
        <div className="flex min-h-96 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-alpha text-black">
                <Plus className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
                No courses yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create the first course and it will show up here as a catalog
                item.
            </p>
            <Button
                type="button"
                className="mt-4 bg-alpha"
                onClick={onCreate}
            >
                <Plus />
                Create course
            </Button>
        </div>
    );
}

function EmptyFilter() {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-border bg-muted/30">
                <Archive className="size-5 text-alpha" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
                No courses in this filter
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Switch filters or reset the catalog view to see the full course
                list.
            </p>
        </div>
    );
}

CoursesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Courses',
            href: '/courses',
        },
    ],
};
