import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="card">
      <button id="counter" type="button">Send network request</button>
    </div>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
