import pandas as pd

from concordutils.lbUtils import compute_lb_freq_from_file, compute_lb_div_from_file


def cal_lb_stats(file_content_list, lb_list):
    lb_df = pd.DataFrame(data=lb_list, columns=['Lexical Bundles'])
    file_content_df = pd.DataFrame(data=file_content_list, columns=['File Name', 'Content'])
    bundle_freq_df = compute_lb_freq_from_file(file_content_df, lb_df)
    bundle_diversity_df = compute_lb_div_from_file(file_content_df, lb_df)
    return {"bundleFreq": bundle_freq_df.to_json(orient='records'),
            "bundleDiversity": bundle_diversity_df.to_json(orient='records')}
