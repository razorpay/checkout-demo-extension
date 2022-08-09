import { render } from '@testing-library/svelte';
import svelte from 'svelte-inline-compile';

describe('WithEllipsis: displays text with ellipsis (loading UI)', () => {
  it('should render with text', async () => {
    jest.useFakeTimers();
    const el = render(svelte`
      <script>  
        import WithEllipsisSvelte from "../WithEllipsis.svelte";
      </script>
      <WithEllipsisSvelte>
        Hi
      </WithEllipsisSvelte>
    `);

    expect(await el.findByText('Hi ..')).toBeTruthy();
  });
});
