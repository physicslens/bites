# Required System Features

## Core Functionality
- Teacher CMS for creating and managing learning modules.
- Module metadata: title, topic, assigned classes.
- Slide-based module content.
- Student login by email only.
- Student portal showing assigned modules and slide content.

## Slide Content Types
- Text blocks with rich text editing.
- LaTeX formula support inside content.
- Image blocks with URL and optional caption.
- Embedded content blocks (iframe/embed URLs).
- Standalone LaTeX blocks for formula display.

## Editing and Preview
- Add/remove slides within a module.
- Add/remove content blocks inside a slide.
- Rich text formatting controls for bold, italic, underline.
- Direct insertion support for LaTeX snippets and images.
- Live preview of slide content for teacher editing.

## Student Interaction
- Class-based module assignment.
- Quiz blocks attached to slides.
- Student answer submission tracking.
- Response summaries for quiz results.

## Data and Persistence
- Local JSON-based store for modules and students.
- API routes for module CRUD and quiz recording.
- Student roster import/edit functionality.
- Compatibility migration for older text block formats.

## User Experience
- Responsive UI using Tailwind CSS.
- Clear teacher/student workflows.
- Safe HTML handling in rendered slide content.
- Fast development preview on localhost.
