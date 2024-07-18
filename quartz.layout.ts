import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer(
    {
    links: {
      "LinkedIn": "https://www.linkedin.com/in/vprimin/",
      "Instagram": "https://www.instagram.com/vprimin/",
      "Радио СКП": "https://www.youtube.com/@skp-radio/",
      "CV": "https://read.cv/vprimin",
      "RSS": "https://slava.skp.kz/index.xml",
    },
  }
  ),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    // Component.Divider(),
  ],
  left: [
    Component.PageTitle(),
    Component.Search(),
    Component.Darkmode(),
    Component.Divider(),
    Component.TagList(),
    Component.DesktopOnly(Component.Explorer({
      title: "Разделы",
      useSavedState: false,
      sortFn: (a, b) => {
        if ((!a.file && !b.file) || (a.file && b.file)) {
          // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
          // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      },
    })),
  ],
  
  right: [
    Component.Graph({
      localGraph: {
        linkDistance: 50,
      },
      globalGraph: {
        linkDistance: 50,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.MobileOnly(Component.RecentNotes({
      title: "Недавние публикации",
      limit: 5
    })),
    Component.MobileOnly(Component.Explorer({
      title: "Разделы",
      useSavedState: true,
      sortFn: (a, b) => {
        if ((!a.file && !b.file) || (a.file && b.file)) {
          // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
          // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      },
    })),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle()],
  left: [
    Component.PageTitle(),
    Component.Search(),
    Component.Darkmode(),
    Component.Divider(),
    Component.DesktopOnly(Component.RecentNotes({
      title: "Недавние публикации",
      limit: 5
    })),
    Component.DesktopOnly(Component.Explorer({
      title: "Разделы",
      useSavedState: true,
      sortFn: (a, b) => {
        if ((!a.file && !b.file) || (a.file && b.file)) {
          // sensitivity: "base": Only strings that differ in base letters compare as unequal. Examples: a ≠ b, a = á, a = A
          // numeric: true: Whether numeric collation should be used, such that "1" < "2" < "10"
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        if (a.file && !b.file) {
          return 1
        } else {
          return -1
        }
      },
    })),
  ],
  right: [],
}
