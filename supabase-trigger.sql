-- 创建用户档案自动创建触发器
-- 当新用户注册时自动创建用户档案

-- 创建函数：自动创建用户档案
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：在用户注册时自动创建档案
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 修改用户档案表的RLS策略，允许服务角色插入
CREATE POLICY "Service role can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 确保用户档案表允许服务角色操作
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON user_profiles TO authenticated;
