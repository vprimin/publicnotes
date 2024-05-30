import { QuartzComponentConstructor } from "../types"

function NotFound() {
  return (
    <article class="popover-hint">
      <h1>404</h1>
      <p>Cтраница не существует или удалена</p>
    </article>
  )
}

export default (() => NotFound) satisfies QuartzComponentConstructor
