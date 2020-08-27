import { basicElement } from './basic.js'

export function progressBar(progress = 0) {
  const percentage = progress.floatToPercentage(0)
  const isComplete = progress === 1
  const barColorClass = isComplete ? 'bg-color-greenLight' : 'bg-color-orange'
  const container = basicElement('div')
  const textContainer = basicElement('div', {
    className: ['clearfix'],
  })
  const progressNumber = basicElement('span', {
    className: ['text-color-green', 'pull-right'],
    text: percentage,
  })
  const barContainer = basicElement('div', {
    className: [
      ...(isComplete ? [] : ['active', 'progress-striped']),
      'progress',
      'progress-sm',
    ],
  })
  const bar = basicElement('div', {
    className: ['progress-bar', barColorClass],
    attributes: {
      role: 'progressbar',
      style: `width: ${percentage}`,
    },
  })
  textContainer.append(progressNumber)
  barContainer.append(bar)
  container.append(textContainer)
  container.append(barContainer)

  return container
}
