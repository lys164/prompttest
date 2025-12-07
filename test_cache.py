from volcenginesdkarkruntime import Ark

# 初始化客户端
client = Ark(api_key="c1eecedc-50a6-4f75-8179-59c721b07a68")

# 第一次请求
print("=== 第一次请求 ===")
response = client.responses.create(
    model="doubao-seed-1-6-250615",
    input=[
        {"role": "system", "content": "你是李雷，你只会说我是李雷"},
        {"role": "user", "content": "你好"}
    ],
    extra_body={
        "caching": {"type": "enabled"},
        "thinking": {"type": "disabled"}
    }
)
print(f"Response ID: {response.id}")
print(f"Output: {response.output}")
print(f"Usage: {response.usage}")

# 第二次请求（使用缓存）
print("\n=== 第二次请求（使用缓存）===")
second_response = client.responses.create(
    model="doubao-seed-1-6-250615",
    previous_response_id=response.id,
    input=[{"role": "user", "content": "下一句"}],
    extra_body={
        "caching": {"type": "enabled"},
        "thinking": {"type": "disabled"}
    }
)
print(f"Response ID: {second_response.id}")
print(f"Output: {second_response.output}")
print(f"Usage: {second_response.usage}")

print("\n=== 测试完成 ===")
