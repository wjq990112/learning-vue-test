import { shallowMount } from '@vue/test-utils';

import Button from './Button';

describe('Button', () => {
  it('should emit click event.', async () => {
    const wrapper = shallowMount(Button);

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeDefined();
  });

  it('should not emit click event when disabled.', async () => {
    const wrapper = shallowMount(Button, {
      props: {
        disabled: true,
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('should not emit click event when loading.', async () => {
    const wrapper = shallowMount(Button, {
      props: {
        loading: true,
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('should render icon correctly.', async () => {
    const wrapper = shallowMount(Button, {
      props: {
        icon: 'icon-rocket',
      },
    });

    expect(wrapper.find('.icon-sync').exists()).toBeFalsy();
    expect(wrapper.find('.icon-rocket').exists()).toBeTruthy();
    expect(wrapper.html()).toMatchSnapshot();

    await wrapper.setProps({ loading: true });

    expect(wrapper.find('.icon-sync').exists()).toBeTruthy();
    expect(wrapper.find('.icon-rocket').exists()).toBeFalsy();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render text correctly.', async () => {
    const wrapper = shallowMount(Button, {
      props: {
        loadingText: 'Custom Loading',
      },
      slots: {
        default: () => <span>Custom Text</span>,
      },
    });

    expect(wrapper.find('span').exists()).toBeTruthy();
    expect(wrapper.find('span').element).toHaveTextContent(/custom text/gi);
    expect(wrapper.find('.icon-sync').exists()).toBeFalsy();
    expect(wrapper.html()).toMatchSnapshot();

    await wrapper.setProps({ loading: true });

    expect(wrapper.find('span').exists()).toBeTruthy();
    expect(wrapper.find('span').element).toHaveTextContent(/custom loading/gi);
    expect(wrapper.find('.icon-sync').exists()).toBeTruthy();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render icon slot correctly.', async () => {
    const wrapper = shallowMount(Button, {
      slots: {
        icon: () => <i class="iconfont icon-rocket" />,
      },
    });

    expect(wrapper.find('.icon-sync').exists()).toBeFalsy();
    expect(wrapper.find('.icon-rocket').exists()).toBeTruthy();
    expect(wrapper.html()).toMatchSnapshot();

    await wrapper.setProps({ loading: true });

    expect(wrapper.find('.icon-sync').exists()).toBeTruthy();
    expect(wrapper.find('.icon-rocket').exists()).toBeFalsy();
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render loading slot correctly.', async () => {
    const wrapper = shallowMount(Button, {
      slots: {
        loadingIcon: () => <i class="iconfont icon-reload" />,
        loadingText: () => <span>Custom Loading</span>,
      },
    });

    expect(wrapper.find('.icon-reload').exists()).toBeFalsy();
    expect(wrapper.find('span').exists()).toBeFalsy();
    expect(wrapper.html()).toMatchSnapshot();

    await wrapper.setProps({ loading: true });

    expect(wrapper.find('.icon-reload').exists()).toBeTruthy();
    expect(wrapper.find('span').element).toHaveTextContent(/custom loading/gi);
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render small button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        size: 'sm',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render large button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        size: 'lg',
      },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render primary button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        type: 'primary',
      },
    });

    expect(wrapper.element).toHaveClass('bg-blue-500');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render success button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        type: 'success',
      },
    });

    expect(wrapper.element).toHaveClass('bg-green-500');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render warning button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        type: 'warning',
      },
    });

    expect(wrapper.element).toHaveClass('bg-yellow-500');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render danger button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        type: 'danger',
      },
    });

    expect(wrapper.element).toHaveClass('bg-red-500');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render block button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        block: true,
      },
    });

    expect(wrapper.element).toHaveClass('block');
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should render round button correctly.', () => {
    const wrapper = shallowMount(Button, {
      props: {
        round: true,
      },
    });

    expect(wrapper.element).toHaveClass('rounded-full');
    expect(wrapper.html()).toMatchSnapshot();
  });
});
