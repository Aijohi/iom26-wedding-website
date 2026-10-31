IOM'26 Wedding Website

A React and Vite wedding website for Omonzele and Ikponmwenosa. The experience begins with an interactive curtain reveal and continues into the complete wedding landing page.

Replace these files

Copy the files into your project using this exact structure:

src
├── Page
│   ├── CurtainReveal.jsx
│   ├── CurtainReveal.css
│   ├── LandingPage.jsx
│   └── LandingPage.css
├── App.jsx
├── App.css
├── index.css
└── main.jsx

The folder name is Page with a capital P. The import paths in App.jsx must also use Page with a capital P.

import CurtainReveal from "./Page/CurtainReveal.jsx";
import LandingPage from "./Page/LandingPage.jsx";

Do not create another folder named page, pages or Pages. Different capitalisation can cause duplicate-file errors.

Add the temporary photographs

Inside public, create a folder named images. Download temporary photographs from Unsplash and give them these exact names:

Filename

Unsplash search words

Best photograph shape

iom26-hero.jpg

elegant black couple engagement outdoor portrait landscape

Wide landscape, couple in the centre, quiet space above them

iom26-story.jpg

black couple romantic engagement portrait

Vertical portrait

iom26-details.jpg

elegant wedding table olive green gold

Wide landscape

iom26-moment-1.jpg

black couple engagement walking

Vertical portrait

iom26-moment-2.jpg

black couple engagement laughing

Landscape or square

iom26-moment-3.jpg

black couple holding hands engagement

Wide landscape

iom26-groom.jpg

black groom portrait suit editorial

Vertical portrait

iom26-bride.jpg

black bride portrait veil editorial

Vertical portrait

iom26-gallery.jpg

wedding reception dancing guests elegant

Vertical or landscape

iom26-guest-memories.jpg

wedding guest taking photo phone

Vertical or landscape

iom26-venue.jpg

elegant wedding venue exterior garden

Wide landscape

Your image folder should look like this:

public
└── images
    ├── iom26-hero.jpg
    ├── iom26-story.jpg
    ├── iom26-details.jpg
    ├── iom26-moment-1.jpg
    ├── iom26-moment-2.jpg
    ├── iom26-moment-3.jpg
    ├── iom26-groom.jpg
    ├── iom26-bride.jpg
    ├── iom26-gallery.jpg
    ├── iom26-guest-memories.jpg
    └── iom26-venue.jpg

Website sections

Curtain opens into the landing page

Responsive navigation and mobile menu

Live wedding countdown

Full story modal

Wedding information cards and programme timeline

Pre-wedding gallery

Bride and groom quote sections

Empty wedding wishes section and working form modal

RSVP form modal with success state

Separate viewing and uploading sections

Location section and footer

Important placeholders

Replace all text inside square brackets when the couple provides the final information. This includes:

Bride's parents

Groom's parents

Church name and address

Reception venue and address

RSVP closing date

Photograph and video upload closing date

Google Drive viewing link

Google Drive uploading link

Google Maps location link

Forms

The forms currently show a success message in the browser only. They are not connected to a database yet. The Google Drive and Google Maps links are temporary and should be replaced later.

The forms that still require a database connection are:

RSVP form

Wedding wishes form

Wedding colours

The main colours are defined near the top of LandingPage.css:

:root {
  --olive-950: #162014;
  --olive-900: #202b1d;
  --olive-800: #2d3928;
  --olive-600: #667052;
  --gold: #c9a454;
  --gold-light: #e4c982;
  --cream: #f7f1e6;
  --ivory: #fffdf8;
}

Start the website

In the Visual Studio Code terminal, run:

npm run dev

Open the local address shown in the terminal, usually http://localhost:5173.

Common import error

If Visual Studio Code says that two filenames differ only in casing, confirm that:

The folder is named Page.

App.jsx imports from ./Page/.

There is no second folder named page, pages or Pages.

All files have been saved.

The development server has been restarted.