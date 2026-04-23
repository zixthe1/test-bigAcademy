"""
Big Academy - Updated Models
Changes from original:
1. Added 'executive_hr' to ROLE_CHOICES (5 roles)
2. Added unique_lms_id (auto-generated with role prefix)
3. Added is_protected (prevents deletion of HR accounts)
4. Added SectionProgress model (tracks video watching + section-by-section quiz flow)
"""
from django.db import models
from django.utils.text import slugify


class Locations(models.Model):
    name           = models.CharField(max_length=150)
    state          = models.CharField(max_length=50)
    region         = models.CharField(max_length=100, blank=True, null=True)
    is_head_office = models.BooleanField(default=False)
    created_at     = models.DateTimeField()
    updated_at     = models.DateTimeField()

    def __str__(self):
        return f"{self.name} ({self.state})"

    class Meta:
        managed = True
        db_table = 'locations'
        verbose_name = 'Location'
        verbose_name_plural = 'Locations'


# ── ROLE PREFIX MAP for auto-generated LMS IDs ──
ROLE_PREFIX = {
    'executive_hr':   'X',
    'hr':             'H',
    'area_manager':   'A',
    'branch_manager': 'B',
    'educator':       'E',
}


class Users(models.Model):

    ROLE_CHOICES = [
        ('executive_hr',    'Executive HR'),      # NEW — Billie only, full system + database
        ('hr',              'HR'),                 # Rob, Billy, Sean — full LMS access
        ('area_manager',    'Area Manager'),        # Create/submit courses for HR approval
        ('branch_manager',  'Branch Manager'),      # View only
        ('educator',        'Educator'),            # View only
    ]

    STATUS_CHOICES = [
        ('active',      'Active'),
        ('disabled',    'Disabled'),
        ('terminated',  'Terminated'),
    ]

    email            = models.CharField(unique=True, max_length=255)
    first_name       = models.CharField(max_length=100)
    last_name        = models.CharField(max_length=100)
    role             = models.CharField(max_length=20, choices=ROLE_CHOICES, default='educator')
    is_hr_executive  = models.BooleanField(default=False)
    location         = models.ForeignKey(Locations, models.DO_NOTHING, blank=True, null=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    password_hash    = models.TextField(blank=True, null=True)
    created_at       = models.DateTimeField(blank=True, null=True)
    updated_at       = models.DateTimeField(blank=True, null=True)
    last_login_at    = models.DateTimeField(blank=True, null=True)
    phone_number     = models.CharField(max_length=20, blank=True, null=True)
    employee_id      = models.CharField(max_length=20, blank=True, null=True)

    # ── NEW FIELDS ──────────────────────────────────────────
    unique_lms_id = models.CharField(
        max_length=50, unique=True, blank=True, null=True,
        help_text='Auto-generated ID like H1-rob, E3-jane'
    )
    is_protected = models.BooleanField(
        default=False,
        help_text='If True, this account cannot be deleted (for HR accounts)'
    )

    def __str__(self):
        display_id = self.unique_lms_id or self.email
        return f"{self.first_name} {self.last_name} ({display_id})"

    def save(self, *args, **kwargs):
        # Auto-generate unique_lms_id on first save
        if not self.unique_lms_id:
            self.unique_lms_id = self._generate_lms_id()
        # Auto-protect HR and Executive HR accounts
        if self.role in ('hr', 'executive_hr'):
            self.is_protected = True
        # Sync is_hr_executive flag with role
        if self.role == 'executive_hr':
            self.is_hr_executive = True
        super().save(*args, **kwargs)

    def _generate_lms_id(self):
        prefix = ROLE_PREFIX.get(self.role, 'U')
        count = Users.objects.filter(role=self.role).count() + 1
        name_slug = slugify(f"{self.first_name}").replace('-', '')[:15]
        return f"{prefix}{count}-{name_slug}"

    class Meta:
        managed = True
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class SuperAdminLocations(models.Model):
    user     = models.ForeignKey(
        Users, models.DO_NOTHING,
        related_name='assigned_locations',
        limit_choices_to={'role': 'area_manager'}
    )
    location = models.ForeignKey(Locations, models.DO_NOTHING)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} -> {self.location}"

    class Meta:
        managed = True
        db_table = 'super_admin_locations'
        unique_together = (('user', 'location'),)
        verbose_name = 'Area Manager Location'
        verbose_name_plural = 'Area Manager Locations'


class Courses(models.Model):
    title             = models.CharField(max_length=255)
    description       = models.TextField(blank=True, null=True)
    version           = models.CharField(max_length=20)
    status            = models.TextField()
    estimated_minutes = models.IntegerField(blank=True, null=True)
    expiry_months     = models.IntegerField(blank=True, null=True)
    created_by        = models.ForeignKey(Users, models.DO_NOTHING, db_column='created_by')
    published_at      = models.DateTimeField(blank=True, null=True)
    created_at        = models.DateTimeField()
    updated_at        = models.DateTimeField()

    def __str__(self):
        return f"{self.title} (v{self.version}) - {self.status}"

    class Meta:
        managed = True
        db_table = 'courses'
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'


class CourseModules(models.Model):
    course     = models.ForeignKey(Courses, models.DO_NOTHING)
    title      = models.CharField(max_length=255)
    sort_order = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    # ── NEW FIELDS for video enforcement ──
    video_url = models.URLField(
        blank=True, null=True,
        help_text='YouTube or video URL for this module section'
    )
    video_duration_seconds = models.IntegerField(
        default=0,
        help_text='Video length in seconds — user must watch the full video'
    )

    def __str__(self):
        return f"{self.title} (Course: {self.course})"

    class Meta:
        managed = True
        db_table = 'course_modules'
        verbose_name = 'Course Module'
        verbose_name_plural = 'Course Modules'


class Lessons(models.Model):
    course           = models.ForeignKey(Courses, models.DO_NOTHING)
    module           = models.ForeignKey(CourseModules, models.DO_NOTHING, blank=True, null=True)
    title            = models.CharField(max_length=255)
    content_type     = models.TextField()
    content_url      = models.TextField(blank=True, null=True)
    duration_seconds = models.IntegerField(blank=True, null=True)
    sort_order       = models.IntegerField()
    created_at       = models.DateTimeField()
    updated_at       = models.DateTimeField()

    def __str__(self):
        return f"{self.title} ({self.content_type})"

    class Meta:
        managed = True
        db_table = 'lessons'
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'


class Assignments(models.Model):
    course          = models.ForeignKey(Courses, models.DO_NOTHING)
    assignment_type = models.TextField()
    target_value    = models.TextField(blank=True, null=True)
    mandatory       = models.BooleanField()
    due_at          = models.DateTimeField(blank=True, null=True)
    created_by      = models.ForeignKey(Users, models.DO_NOTHING, db_column='created_by')
    created_at      = models.DateTimeField()
    updated_at      = models.DateTimeField()

    def __str__(self):
        return f"{self.course} - {self.assignment_type} (mandatory: {self.mandatory})"

    class Meta:
        managed = True
        db_table = 'assignments'
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'


class Enrolments(models.Model):
    user         = models.ForeignKey(Users, models.DO_NOTHING)
    course       = models.ForeignKey(Courses, models.DO_NOTHING)
    source       = models.TextField()
    status       = models.TextField()
    started_at   = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at   = models.DateTimeField()
    updated_at   = models.DateTimeField()

    def __str__(self):
        return f"{self.user} -> {self.course} ({self.status})"

    class Meta:
        managed = True
        db_table = 'enrolments'
        verbose_name = 'Enrolment'
        verbose_name_plural = 'Enrolments'
        unique_together = (('user', 'course'),)


class LessonProgress(models.Model):
    user               = models.ForeignKey(Users, models.DO_NOTHING)
    lesson             = models.ForeignKey(Lessons, models.DO_NOTHING)
    status             = models.TextField()
    progress_percent   = models.SmallIntegerField(blank=True, null=True)
    time_spent_seconds = models.IntegerField(blank=True, null=True)
    completed_at       = models.DateTimeField(blank=True, null=True)
    created_at         = models.DateTimeField()
    updated_at         = models.DateTimeField()

    def __str__(self):
        return f"{self.user} - {self.lesson} ({self.progress_percent}%)"

    class Meta:
        managed = True
        db_table = 'lesson_progress'
        verbose_name = 'Lesson Progress'
        verbose_name_plural = 'Lesson Progress'
        unique_together = (('user', 'lesson'),)


class Quizzes(models.Model):
    course            = models.ForeignKey(Courses, models.DO_NOTHING, blank=True, null=True)
    lesson            = models.ForeignKey(Lessons, models.DO_NOTHING, blank=True, null=True)
    title             = models.CharField(max_length=255)
    pass_mark_percent = models.SmallIntegerField()
    attempt_limit     = models.IntegerField(blank=True, null=True)
    created_at        = models.DateTimeField()
    updated_at        = models.DateTimeField()

    # ── NEW FIELD: step-by-step mode ──
    step_by_step = models.BooleanField(
        default=False,
        help_text='If True, questions are presented section-by-section (VicRoads style). Each module = one section.'
    )

    def __str__(self):
        return f"{self.title} (pass mark: {self.pass_mark_percent}%)"

    class Meta:
        managed = True
        db_table = 'quizzes'
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'


class QuizQuestions(models.Model):
    quiz          = models.ForeignKey(Quizzes, models.DO_NOTHING)
    question_text = models.TextField()
    question_type = models.TextField()
    sort_order    = models.IntegerField()
    created_at    = models.DateTimeField()
    updated_at    = models.DateTimeField()

    # ── NEW FIELD: link question to a module section ──
    module = models.ForeignKey(
        CourseModules, models.DO_NOTHING, blank=True, null=True,
        help_text='Which module/section this question belongs to (for step-by-step mode)'
    )

    def __str__(self):
        return f"Q{self.sort_order}: {self.question_text[:60]}"

    class Meta:
        managed = True
        db_table = 'quiz_questions'
        verbose_name = 'Quiz Question'
        verbose_name_plural = 'Quiz Questions'


class QuizOptions(models.Model):
    question    = models.ForeignKey(QuizQuestions, models.DO_NOTHING)
    option_text = models.TextField()
    is_correct  = models.BooleanField()
    sort_order  = models.IntegerField()

    def __str__(self):
        correct = 'V' if self.is_correct else 'X'
        return f"{correct} {self.option_text[:60]}"

    class Meta:
        managed = True
        db_table = 'quiz_options'
        verbose_name = 'Quiz Option'
        verbose_name_plural = 'Quiz Options'


class QuizAttempts(models.Model):
    user                = models.ForeignKey(Users, models.DO_NOTHING)
    quiz                = models.ForeignKey(Quizzes, models.DO_NOTHING)
    score_percent       = models.SmallIntegerField(blank=True, null=True)
    passed              = models.BooleanField()
    started_at          = models.DateTimeField(blank=True, null=True)
    submitted_at        = models.DateTimeField(blank=True, null=True)
    created_at          = models.DateTimeField()
    short_answer_score  = models.SmallIntegerField(blank=True, null=True)
    graded_by           = models.ForeignKey(
        Users, models.DO_NOTHING,
        null=True, blank=True,
        related_name='graded_attempts',
        db_column='graded_by'
    )
    graded_at           = models.DateTimeField(null=True, blank=True)
    grading_status      = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('graded', 'Graded')],
        default='pending'
    )
    declaration_signed  = models.BooleanField(default=False)
    declaration_name    = models.CharField(max_length=200, blank=True, null=True)

    # ── NEW FIELD: track which module section user is currently on ──
    current_section_order = models.IntegerField(
        default=1,
        help_text='For step-by-step quizzes, tracks which section the user is on'
    )

    def __str__(self):
        result = 'PASSED' if self.passed else 'FAILED'
        return f"{self.user} - {self.quiz} - {result} ({self.score_percent}%)"

    class Meta:
        managed = True
        db_table = 'quiz_attempts'
        verbose_name = 'Quiz Attempt'
        verbose_name_plural = 'Quiz Attempts'


class QuizAnswers(models.Model):
    attempt           = models.ForeignKey(QuizAttempts, models.DO_NOTHING)
    question          = models.ForeignKey(QuizQuestions, models.DO_NOTHING)
    selected_option   = models.ForeignKey(QuizOptions, models.DO_NOTHING, blank=True, null=True)
    short_answer_text = models.TextField(blank=True, null=True)
    is_correct        = models.BooleanField(default=False)

    def __str__(self):
        correct = 'Correct' if self.is_correct else 'Wrong'
        return f"Attempt {self.attempt_id} - Q{self.question_id} - {correct}"

    class Meta:
        managed = True
        db_table = 'quiz_answers'
        verbose_name = 'Quiz Answer'
        verbose_name_plural = 'Quiz Answers'


class Certificates(models.Model):
    certificate_id   = models.UUIDField(unique=True)
    user             = models.ForeignKey(Users, models.DO_NOTHING)
    course           = models.ForeignKey(Courses, models.DO_NOTHING)
    course_version   = models.CharField(max_length=20)
    issued_at        = models.DateTimeField()
    file_storage_key = models.TextField(blank=True, null=True)
    created_at       = models.DateTimeField()
    expires_at       = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} - {self.course}"

    class Meta:
        managed = True
        db_table = 'certificates'
        verbose_name = 'Certificate'
        verbose_name_plural = 'Certificates'


class QuizUnlockRequests(models.Model):

    STATUS_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('denied',   'Denied'),
    ]

    user         = models.ForeignKey(Users, models.DO_NOTHING, related_name='unlock_requests')
    quiz         = models.ForeignKey(Quizzes, models.DO_NOTHING)
    reason       = models.TextField()
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_by  = models.ForeignKey(
        Users, models.DO_NOTHING, null=True, blank=True,
        related_name='reviewed_requests', db_column='reviewed_by'
    )
    reviewed_at  = models.DateTimeField(null=True, blank=True)
    review_note  = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.quiz} - {self.status}"

    class Meta:
        managed = True
        db_table = 'quiz_unlock_requests'
        verbose_name = 'Quiz Unlock Request'
        verbose_name_plural = 'Quiz Unlock Requests'


class Notifications(models.Model):

    TYPE_CHOICES = [
        ('certificate_issued',  'Certificate Issued'),
        ('quiz_locked',         'Quiz Locked'),
        ('unlock_approved',     'Unlock Approved'),
        ('unlock_denied',       'Unlock Denied'),
        ('short_answer_graded', 'Short Answer Graded'),
        ('general',             'General'),
    ]

    recipient  = models.ForeignKey(Users, models.DO_NOTHING, related_name='notifications')
    notif_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    title      = models.CharField(max_length=255)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.recipient} - {self.notif_type}"

    class Meta:
        managed = True
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']


# ══════════════════════════════════════════════════════════════
# NEW MODEL: Section Progress
# Tracks video watching + section-by-section quiz progress
# ══════════════════════════════════════════════════════════════
class SectionProgress(models.Model):
    """Tracks per-section progress for step-by-step quizzes."""

    STATUS_CHOICES = [
        ('locked',             'Locked'),
        ('watch_video',        'Watch Video'),
        ('answer_questions',   'Answer Questions'),
        ('passed',             'Passed'),
        ('failed',             'Failed - Retry Required'),
    ]

    attempt       = models.ForeignKey(QuizAttempts, models.CASCADE, related_name='section_progress')
    module        = models.ForeignKey(CourseModules, models.DO_NOTHING)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='locked')
    video_watched = models.BooleanField(default=False)
    correct_count = models.IntegerField(default=0)
    total_count   = models.IntegerField(default=0)
    attempt_count = models.IntegerField(default=0)

    class Meta:
        managed = True
        db_table = 'section_progress'
        ordering = ['module__sort_order']
        unique_together = (('attempt', 'module'),)

    def __str__(self):
        return f"Section {self.module.sort_order}: {self.status}"
